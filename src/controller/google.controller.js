
import crypto from "node:crypto";
import User from "../models/user.model.js";
import { GOOGLE_CONFIG } from "../config/google.config.js";
import { generateTokens } from "../services/auth.services.js";
import { JWT_CONFIG } from "../config/jwt.config.js";

const STATE_COOKIE = "google_oauth_state";

const stateCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 10 * 60 * 1000,
  path: "/api/auth/google/callback",
};

function clearStateCookie(res) {
  res.clearCookie(STATE_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google/callback",
  });
}

// STEP 1: Redirect user to Google
export function googleLogin(req, res) {
  try {
    const {
      clientId,
      callbackUrl,
      authorizeUrl,
    } = GOOGLE_CONFIG;

    if (!clientId || !callbackUrl) {
      return res.status(500).json({
        success: false,
        message: "Google OAuth is not configured",
      });
    }

    const state = crypto.randomBytes(32).toString("hex");

    res.cookie(STATE_COOKIE, state, stateCookieOptions);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: "openid email profile",
      state,
    });

    return res.redirect(
      `${authorizeUrl}?${params.toString()}`
    );
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to start Google authentication",
    });
  }
}

// STEP 2: Exchange authorization code for Google access token
async function getGoogleAccessToken(code) {
  const response = await fetch(GOOGLE_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CONFIG.clientId,
      client_secret: GOOGLE_CONFIG.clientSecret,
      redirect_uri: GOOGLE_CONFIG.callbackUrl,
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    console.error("Google token exchange failed:", data.error);
    throw new Error("Failed to exchange Google authorization code");
  }

  return data.access_token;
}

// STEP 3: Fetch authenticated Google user information
async function getGoogleProfile(accessToken) {
  const response = await fetch(GOOGLE_CONFIG.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to fetch Google profile");
  }

  const profile = await response.json();

  if (
    !profile.sub ||
    !profile.email ||
    profile.email_verified !== true
  ) {
    throw new Error(
      "Google account does not have a verified email"
    );
  }

  return profile;
}

// STEP 4: Find or create application user
async function findOrCreateUser(profile) {
  const googleId = String(profile.sub);
  const email = profile.email.trim().toLowerCase();

  // Check whether this Google account is already linked
  const googleUser = await User.findOne({ googleId });

  if (googleUser) {
    return googleUser;
  }

  // Check whether this email already belongs to an account
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    // Do not silently link an unverified local account
    if (!existingUser.isVerified) {
      const error = new Error(
        "Please verify your existing email account before linking Google."
      );
      error.statusCode = 403;
      throw error;
    }

    // Prevent linking a different Google account
    if (
      existingUser.googleId &&
      String(existingUser.googleId) !== googleId
    ) {
      const error = new Error(
        "This email is already linked to another Google account."
      );
      error.statusCode = 409;
      throw error;
    }

    // Link Google to the existing account.
    // Preserve password, role, name, avatar and authProvider.
    existingUser.googleId = googleId;

    await existingUser.save();

    return existingUser;
  }

  // Create a new Google account
  const newUser = await User.create({
    name: profile.name?.trim() || profile.email.split("@")[0],
    email,
    avatar: profile.picture || "",
    googleId,
    authProvider: "google",
    isVerified: true,
    role: "user",
  });

  return newUser;
}

// STEP 5: Complete Google OAuth callback
export async function googleCallback(req, res) {
  try {
    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not configured");
    }

    const {
      code,
      state,
      error,
    } = req.query;

    const savedState = req.cookies?.[STATE_COOKIE];

    if (error) {
      clearStateCookie(res);

      return res.status(401).json({
        success: false,
        message: "Google authentication was cancelled or denied",
      });
    }

    if (
      typeof code !== "string" ||
      typeof state !== "string" ||
      typeof savedState !== "string"
    ) {
      clearStateCookie(res);

      return res.status(400).json({
        success: false,
        message: "Invalid OAuth callback",
      });
    }

    const receivedState = Buffer.from(state);
    const expectedState = Buffer.from(savedState);

    if (
      receivedState.length !== expectedState.length ||
      !crypto.timingSafeEqual(receivedState, expectedState)
    ) {
      clearStateCookie(res);

      return res.status(403).json({
        success: false,
        message: "Invalid OAuth state",
      });
    }

    clearStateCookie(res);

    if (
      !GOOGLE_CONFIG.clientId ||
      !GOOGLE_CONFIG.clientSecret ||
      !GOOGLE_CONFIG.callbackUrl
    ) {
      throw new Error("Google OAuth is not configured");
    }

    // Exchange authorization code
    const googleAccessToken =
      await getGoogleAccessToken(code);

    // Fetch verified Google profile
    const profile =
      await getGoogleProfile(googleAccessToken);

    // Find or create application user
    const user = await findOrCreateUser(profile);

    // Generate existing application JWT tokens
    const { refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;

    await user.save({
      validateBeforeSave: false,
    });

    // Set HTTP-only refresh token cookie
    res.cookie(
      "refreshToken",
      refreshToken,
      JWT_CONFIG.cookieOptions
    );

    // Redirect to existing frontend callback
    const redirectUrl = new URL(
      "/auth/callback",
      frontendUrl
    );

    redirectUrl.searchParams.set("provider", "google");

    return res.redirect(redirectUrl.toString());

  } catch (error) {
    console.error("Google callback error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode === 403 || error.statusCode === 409
          ? error.message
          : "Google authentication failed",
    });
  }
}

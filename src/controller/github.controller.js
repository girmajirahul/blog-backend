
import crypto from "node:crypto";
import User from "../models/user.model.js";
import { GITHUB_CONFIG } from "../config/github.config.js";
import { generateTokens } from "../services/auth.services.js";
import { JWT_CONFIG } from "../config/jwt.config.js";

const STATE_COOKIE = "github_oauth_state";

const stateCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 10 * 60 * 1000,
  path: "/api/auth/github/callback",
};

function clearStateCookie(res) {
  res.clearCookie(STATE_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/github/callback",
  });
}

// STEP 1: Redirect user to GitHub
export function githubLogin(req, res) {
  try {
    const {
      clientId,
      authorizeUrl,
      callbackUrl,
    } = GITHUB_CONFIG;

    if (!clientId || !callbackUrl) {
      return res.status(500).json({
        success: false,
        message: "GitHub OAuth is not configured",
      });
    }

    const state = crypto.randomBytes(32).toString("hex");

    res.cookie(STATE_COOKIE, state, stateCookieOptions);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: "read:user user:email",
      state,
    });

    return res.redirect(
      `${authorizeUrl}?${params.toString()}`
    );
  } catch (error) {
    console.error("GitHub login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to start GitHub authentication",
    });
  }
}

// STEP 2: Exchange GitHub authorization code for access token
async function getGitHubAccessToken(code) {
  const response = await fetch(GITHUB_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CONFIG.clientId,
      client_secret: GITHUB_CONFIG.clientSecret,
      code,
      redirect_uri: GITHUB_CONFIG.callbackUrl,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error || !data.access_token) {
    throw new Error("Failed to exchange GitHub authorization code");
  }

  return data.access_token;
}

// STEP 3: Fetch GitHub user profile
async function getGitHubProfile(accessToken) {
  const response = await fetch(GITHUB_CONFIG.userUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to fetch GitHub profile");
  }

  return response.json();
}

// STEP 4: Fetch verified primary email
async function getGitHubEmail(accessToken) {
  const response = await fetch(GITHUB_CONFIG.emailsUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to fetch GitHub email");
  }

  const emails = await response.json();

  const primaryEmail = emails.find(
    (email) => email.primary && email.verified
  );

  if (!primaryEmail) {
    throw new Error(
      "No verified primary email found in GitHub account"
    );
  }

  return primaryEmail.email.toLowerCase();
}

// STEP 5: Find or create application user
async function findOrCreateUser(profile, email) {
  const githubId = String(profile.id);

  // Existing GitHub user
  let user = await User.findOne({ githubId });

  if (user) {
    return user;
  }

  // Check whether this email already belongs to a local account
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error(
      "An account with this email already exists. Please log in normally before linking GitHub."
    );

    error.statusCode = 409;
    throw error;
  }

  // Create a new GitHub user
  user = await User.create({
    name: profile.name?.trim() || profile.login,
    email,
    avatar: profile.avatar_url || "",
    githubId,
    authProvider: "github",
    isVerified: true,
    role: "user",
  });

  return user;
}

// STEP 6: Complete OAuth callback
export async function githubCallback(req, res) {
  try {
    const { code, state, error } = req.query;
    const savedState = req.cookies?.[STATE_COOKIE];

    if (error) {
      clearStateCookie(res);

      return res.status(401).json({
        success: false,
        message: "GitHub authentication was cancelled or denied",
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
      !GITHUB_CONFIG.clientId ||
      !GITHUB_CONFIG.clientSecret ||
      !GITHUB_CONFIG.callbackUrl
    ) {
      throw new Error("GitHub OAuth is not configured");
    }

    // Exchange code for GitHub token
    const githubAccessToken =
      await getGitHubAccessToken(code);

    // Fetch profile and verified email
    const profile =
      await getGitHubProfile(githubAccessToken);

    const email =
      await getGitHubEmail(githubAccessToken);

    // Find or create application user
    const user =
      await findOrCreateUser(profile, email);

    // Generate your existing application JWT tokens
    const { accessToken, refreshToken } =
      generateTokens(user);

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

    // Redirect to frontend callback page
    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not configured");
    }

    const redirectUrl = new URL(
      "/auth/callback?provider=github",
      frontendUrl
    );

    redirectUrl.searchParams.set("provider", "github");

    // Access token is intentionally not placed in the URL.
    // Frontend will call /api/auth/refresh to obtain it.
    return res.redirect(redirectUrl.toString());

  } catch (error) {
    console.error("GitHub callback error:", error);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.statusCode === 409
          ? error.message
          : "GitHub authentication failed",
    });
  }
}

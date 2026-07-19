import User from "../models/user.model.js";
import { generateTokens, verifyRefreshToken } from "../services/auth.services.js";
import { JWT_CONFIG } from "../config/jwt.config.js";

// ── Helper: send tokens ────────────────────────────────────────
function sendTokenResponse(res, user, statusCode = 200) {
  const { accessToken, refreshToken } = generateTokens(user);

  // Save refresh token in DB
  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false }); // don't re-validate other fields

  // Set refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, JWT_CONFIG.cookieOptions);

  res.status(statusCode).json({
    success: true,
    accessToken,
    user,
  });
}

// ── POST /api/auth/register ────────────────────────────────────
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Create user (password hashed in model pre-save hook)
    const user = await User.create({ name, email, password });

    return sendTokenResponse(res, user, 201);
  } catch (error) {
    // Mongoose validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ── POST /api/auth/login ───────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Fetch user WITH password (select: false in schema)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return sendTokenResponse(res, user);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ── POST /api/auth/logout ──────────────────────────────────────
export async function logout(req, res) {
  try {
    // Clear refresh token from DB
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });

    // Clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ── GET /api/auth/me ───────────────────────────────────────────
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ── POST /api/auth/refresh ─────────────────────────────────────
export async function refreshAccessToken(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token" });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    // Check if token matches DB
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    return sendTokenResponse(res, user);
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }
    console.error("Refresh error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ── PUT /api/auth/update-profile ──────────────────────────────
export async function updateProfile(req, res) {
  try {
    const { name, bio, avatar } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, avatar },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, user: updated });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    console.error("UpdateProfile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ── PUT /api/auth/change-password ─────────────────────────────
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("ChangePassword error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

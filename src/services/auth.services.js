import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt.config.js";

// ── Generate access token (short lived — 15m) ─────────────────
export function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_CONFIG.accessSecret, {
    expiresIn: JWT_CONFIG.accessExpiry,
  });
}

// ── Generate refresh token (long lived — 7d) ──────────────────
export function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_CONFIG.refreshSecret, {
    expiresIn: JWT_CONFIG.refreshExpiry,
  });
}

// ── Verify access token ────────────────────────────────────────
export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_CONFIG.accessSecret);
}

// ── Verify refresh token ───────────────────────────────────────
export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_CONFIG.refreshSecret);
}

// ── Generate both tokens at once ──────────────────────────────
export function generateTokens(user) {
  const payload = {
    id:    user._id,
    email: user.email,
    role:  user.role,
  };
  return {
    accessToken:  generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

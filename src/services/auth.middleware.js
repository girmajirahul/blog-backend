import { verifyAccessToken } from "../services/auth.services.js";

// ── Protect: verify access token ──────────────────────────────
export function protect(req, res, next) {
  try {
    // Get token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    // Attach user payload to request
    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please refresh.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
}

// ── Admin only ─────────────────────────────────────────────────
export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }
  next();
}

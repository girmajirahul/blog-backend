import express from "express";
import {
    register,
    login,
    logout,
    getMe,
    refreshAccessToken,
    updateProfile,
    changePassword,
} from "../controller/auth.controller.js";
import { protect } from "../services/auth.middleware.js";

const router = express.Router();

// ── Public routes (no token needed) ───────────────────────────
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);

// ── Protected routes (token required) ─────────────────────────
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;

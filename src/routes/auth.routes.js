import express from "express";
import {
    register,
    login,
    logout,
    getMe,
    refreshAccessToken,
    updateProfile,
    changePassword,
    setPassword,
} from "../controller/auth.controller.js";

import {
  githubLogin,
  githubCallback,
} from "../controller/github.controller.js";


import { protect } from "../services/auth.middleware.js";
import { googleCallback, googleLogin } from "../controller/google.controller.js";

const router = express.Router();

// ── Public routes (no token needed) ───────────────────────────
router.post("/register", register); 
router.post("/login", login);
router.post("/refresh", refreshAccessToken);

/** github auth login  */
router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);

/** google auth login */

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

// ── Protected routes (token required) ─────────────────────────
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.put("/set-password", protect, setPassword);

export default router;

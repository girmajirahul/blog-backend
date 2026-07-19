import express from "express";
import {
  subscribe,
  
} from "./subscribe.controller.js";

const router = express.Router();

// ── Public ─────────────────────────────────────────────────────
router.post("/",subscribe);



export default router;
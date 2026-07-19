import express from "express";
import { contact } from "./contact.controller.js";

const router = express.Router();


router.post("/", contact);

export default router;
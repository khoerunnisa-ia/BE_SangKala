import express from "express";
import { chatWithAI } from "../controller/ai_controller.js";

const router = express.Router();

// POST /chat
router.post("/chat", chatWithAI);

export default router;

import express from "express";
import {getQuizByMaterial, submitQuiz} from "../controller/quiz.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:materialId", authMiddleware, getQuizByMaterial);

router.put("/progress/:materialId/quiz", authMiddleware, submitQuiz);

export default router;
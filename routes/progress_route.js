// import { Router } from "express";
// import express from "express";
// import { addProgress, markAsDone, updateScore, submitQuiz, goToNextMaterial } from "../controller/progress.controller.js";

// const router = express.Router();

// // Tambahkan progress baru
// router.post("/add", addProgress);

// // Tandai materi sudah selesai
// router.patch("/done", markAsDone);

// // Update score manual (A–D)
// router.patch("/score", updateScore);

// // Submit quiz dan hitung score otomatis
// router.post("/quiz/submit", submitQuiz);

// router.patch("/next", goToNextMaterial);

// export default router;

import express from "express";
import {authMiddleware} from "../middleware/authMiddleware.js";
import {addProgress, saveState, markAsDone, submitQuiz, goToNextMaterial} from "../controller/progress.controller.js";
import Progress from "../models/progress.model.js"

const router = express.Router();

// 🔹 Get semua progress user yang sedang login
router.get("/",authMiddleware,  async (req, res) => {
  try {
    const progress = await Progress
      .find({ userId: req.user.id })
      .populate("materialId");
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Get progress spesifik berdasarkan materi
router.get("/:materialId",authMiddleware, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      userId: req.user.id,
      materialId: req.params.materialId,
    }).populate("materialId");

    if (!progress) return res.status(404).json({ error: "Progress not found" });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Buat progress baru untuk materi tertentu
router.post("/add",authMiddleware, addProgress);

// 🔹 Simpan posisi halaman terakhir (currentPage)
router.patch("/state",authMiddleware,  saveState);

// 🔹 Tandai materi sudah selesai
router.patch("/done",authMiddleware,  markAsDone);

// 🔹 Submit quiz & hitung score
router.post("/quiz/submit",authMiddleware, submitQuiz);

// 🔹 Lanjut ke materi berikutnya
router.patch("/next",authMiddleware, goToNextMaterial);

// route khusus update currentPage
router.patch("/page", authMiddleware, saveState);

export default router;

import express from "express";
import { getAllMaterials, getMaterialById  } from "../controller/material.controller.js";

const router = express.Router();

// GET semua materi
router.get("/", getAllMaterials);

// GET materi berdasarkan ID
router.get("/:id", getMaterialById);

export default router;

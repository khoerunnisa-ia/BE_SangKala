import materialModel from "../models/material.model.js";

// Ambil semua materi
export const getAllMaterials = async (req, res) => {
  try {
    const materials = await materialModel.find();
    res.json(materials);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Ambil materi berdasarkan ID
export const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await materialModel.findById(id);
    if (!material) return res.status(404).json({ error: "Material not found" });
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

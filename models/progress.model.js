// src/models/progress.model.js
import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: "Materi", required: true },
  done: { type: Boolean, default: false }, 
  currentIndex: { type: Number, default: 0 }, 
  quizTaken: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
});

export default mongoose.model("Progress", progressSchema);

import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  label: { type: String, enum: ["A", "B", "C", "D"], required: true },
  text: { type: String, required: true }
});

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [optionSchema],
  correctAnswer: { type: String, enum: ["A", "B", "C", "D"], required: true }
});

const quizSchema = new mongoose.Schema({
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: "Materi", required: true },
  questions: [questionSchema]
});

export default mongoose.model("Quiz", quizSchema);

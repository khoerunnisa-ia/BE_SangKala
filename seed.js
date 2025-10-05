// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";

import userModel from "./models/user.model.js";
import materialModel from "./models/material.model.js";
import progressModel from "./models/progress.model.js";
import quizModel from "./models/quiz.model.js";

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // --- Hapus data lama ---
    await userModel.deleteMany({});
    await materialModel.deleteMany({});
    await progressModel.deleteMany({});
    await quizModel.deleteMany({});
    console.log("🧹 Old data cleared");

    // --- Dummy user ---
    const user = await userModel.create({
      userId: "U007",
      username: "ice",
      password: "password123",
      email: "ice@example.com",
    });

    // --- Dummy Materials ---
    const materiDocs = await materialModel.insertMany([
      {
        id: 1,
        img: "https://res.cloudinary.com/dsoqeww08/image/upload/v1758726260/samples/coffee.jpg",
        materi: "Pengenalan Dasar",
        description: "Materi pengenalan dasar untuk memulai.",
        content: ["content 1 materi 1", "content 2 materi 1"],
      },
      {
        id: 2,
        img: "https://res.cloudinary.com/dsoqeww08/image/upload/v1758726260/samples/cup-on-a-table.jpg",
        materi: "Matematika Dasar",
        description: "Materi dasar aritmatika sederhana.",
        content: ["ini content 1 materi 2", "ini content 2 materi 2"],
      },
      {
        id: 3,
        img: "https://res.cloudinary.com/dsoqeww08/image/upload/v1758726260/samples/canvas.jpg",
        materi: "Belajar Coding",
        description: "Pengenalan bahasa pemrograman modern.",
        content: ["ini content 1 materi 3", "ini content 2 materi 3"],
      },
    ]);

    // --- Quizzes ---
    const quizzes = await quizModel.insertMany([
      {
        materialId: materiDocs[0]._id,
        questions: [
          {
            questionText: "Apa ibu kota Indonesia?",
            options: [
              { label: "A", text: "Jakarta" },
              { label: "B", text: "Bandung" },
              { label: "C", text: "Surabaya" },
              { label: "D", text: "Medan" },
            ],
            correctAnswer: "A",
          },
        ],
      },
      {
        materialId: materiDocs[1]._id,
        questions: [
          {
            questionText: "2 + 5 = ?",
            options: [
              { label: "A", text: "6" },
              { label: "B", text: "7" },
              { label: "C", text: "8" },
              { label: "D", text: "9" },
            ],
            correctAnswer: "B",
          },
        ],
      },
      {
        materialId: materiDocs[2]._id,
        questions: [
          {
            questionText: "Bahasa pemrograman untuk web backend?",
            options: [
              { label: "A", text: "HTML" },
              { label: "B", text: "CSS" },
              { label: "C", text: "JavaScript (Node.js)" },
              { label: "D", text: "Photoshop" },
            ],
            correctAnswer: "C",
          },
        ],
      },
    ]);

    // --- Update materi dengan quizId ---
    for (let i = 0; i < materiDocs.length; i++) {
      materiDocs[i].quizId = quizzes[i]._id;
      await materiDocs[i].save();
    }

    // --- Progress untuk materi pertama ---
    const progress = await progressModel.create({
      userId: user._id,
      materialId: materiDocs[0]._id,
      done: false,
      currentIndex: 0,
      quizTaken: false,
      score: 0,
    });

    // --- Update user dengan progress ---
    user.progress = progress._id;
    await user.save();

    console.log("✅ Dummy Data Inserted");
    console.log({ user, materiDocs, quizzes, progress });
  } catch (err) {
    console.error("❌ Error seeding data:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

seed();

// src/controllers/progress.controller.js
import materialModel from "../models/material.model.js";
import progressModel from "../models/progress.model.js";
import userModel from "../models/user.model.js";
import quizModel from "../models/quiz.model.js";

// 1. Buat progress baru untuk user di materi tertentu
export const addProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { materialId } = req.body;

    const user = await userModel.findById(userId).populate("progress");
    if (!user) return res.status(404).json({ error: "User not found" });

    // cek apakah progress sudah ada
    const existing = await progressModel.findOne({ userId, materialId });
    if (existing) {
      return res.status(400).json({ error: "Progress already exists" });
    }

    const progress = new progressModel({ userId, materialId });
    await progress.save();

    user.progress.push(progress._id);
    await user.save();

    // populate sebelum kirim
    const populated = await progressModel.findById(progress._id).populate("materialId");

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 3. Tandai materi sudah selesai
export const markAsDone = async (req, res) => {
  try {
    const { progressId } = req.body;
    const updated = await progressModel
      .findByIdAndUpdate(progressId, { done: true }, { new: true })
      .populate("materialId");

    if (!updated) return res.status(404).json({ error: "Progress not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const convertToGrade = (correct, length) => {
   if(length == 0) return 0;
   return Math.round((correct/length) *100);
  }

// 4. Submit quiz & hitung score
export const submitQuiz = async (req, res) => {
  try {
    const { progressId, quizId, answers } = req.body;
    console.log("REQ BODY:", req.body); // debug payload

    const quiz = await quizModel.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    let correct = 0;
    quiz.questions.forEach((q) => {
      const userAnswer = answers.find((a) => a.questionId === q._id.toString());
      if (userAnswer && userAnswer.selectedOption === q.correctAnswer) {
        correct++;
      }
    });
    console.log(`Correct: ${correct}/${quiz.questions.length}`);

    const grade = convertToGrade(correct, quiz.questions.length);
    console.log("Final Grade:", grade);

    const updated = await progressModel
      .findByIdAndUpdate(
        progressId,
        { score: grade, quizTaken: true },
        { new: true }
      )
      .populate("materialId");

    if (!updated) return res.status(404).json({ error: "Progress not found" });

    res.json({
      message: "Quiz submitted successfully",
      correct,
      total: quiz.questions.length,
      score: grade,
      progress: updated,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 5. Lanjut ke materi berikutnya (sudah benar kamu populate)
export const goToNextMaterial = async (req, res) => {
  try {
    const { progressId } = req.body;

    const progress = await progressModel.findById(progressId).populate("materialId");
    if (!progress) return res.status(404).json({ error: "Progress not found" });

    if (!progress.materialId || progress.materialId.id == null) {
      return res.status(400).json({ error: "Material numeric id not found" });
    }

    // kalau progress sudah done, jangan pakai lagi
    if (progress.done) {
      console.log("Progress lama sudah selesai, cari materi berikutnya...");
    }

    const currentNumericId = progress.materialId.id;
    const nextMateri = await materialModel.findOne({ id: currentNumericId + 1 });
    if (!nextMateri) {
      return res.json({ message: "No more materials, user has finished all." });
    }

    // cek apakah progress untuk materi berikutnya sudah ada
    let newProgress = await progressModel.findOne({
      userId: progress.userId,
      materialId: nextMateri._id,
    }).populate("materialId");

    if (!newProgress) {
      newProgress = new progressModel({
        userId: progress.userId,
        materialId: nextMateri._id,
      });
      await newProgress.save();

      const user = await userModel.findById(progress.userId);
      if (user) {
        user.progress.push(newProgress._id);
        await user.save();
      }

      newProgress = await progressModel.findById(newProgress._id).populate("materialId");
    }

    res.json({ message: "Moved to next material", progress: newProgress });
  } catch (err) {
    console.error("goToNextMaterial error:", err);
    res.status(500).json({ error: err.message });
  }
};



// // 1. Buat progress baru untuk user di materi tertentu
// export const addProgress = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { materialId } = req.body;

//     const user = await userModel.findById(userId).populate("progress");
//     if (!user) return res.status(404).json({ error: "User not found" });

//     // cek apakah progress sudah ada
//     const existing = await progressModel.findOne({ userId, materialId });
//     if (existing) {
//       return res.status(400).json({ error: "Progress already exists" });
//     }

//     const progress = new progressModel({ userId, materialId });
//     await progress.save();

//     user.progress.push(progress._id);
//     await user.save();

//     res.status(201).json(progress);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // 2. Update state posisi (misalnya user lagi di page index ke berapa)
export const saveState = async (req, res) => {
  try {
    const { progressId, currentIndex } = req.body;

    const progress = await progressModel.findById(progressId).populate("materialId");
    if (!progress) return res.status(404).json({ error: "Progress not found" });

    // cek apakahcurrentIndex sudah sampai akhir
    const totalPages = progress.materialId.content.length;
    progress.currentIndex =currentIndex;
    if (currentIndex >= totalPages - 1) {
      progress.done = true;
    }

    await progress.save();
    res.json(progress);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// // 3. Tandai materi sudah selesai
// export const markAsDone = async (req, res) => {
//   try {
//     const { progressId } = req.body;
//     const updated = await progressModel.findByIdAndUpdate(
//       progressId,
//       { done: true },
//       { new: true }
//     );
//     if (!updated) return res.status(404).json({ error: "Progress not found" });
//     res.json(updated);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // 4. Submit quiz & hitung score
// function convertToGrade(correct, total) {
//   const percent = (correct / total) * 100;
//   if (percent >= 85) return "A";
//   if (percent >= 70) return "B";
//   if (percent >= 50) return "C";
//   return "D";
// }

// export const submitQuiz = async (req, res) => {
//   try {
//     const { progressId, quizId, answers } = req.body;
//     // answers = [{ questionId, selectedOption }]

//     const quiz = await quizModel.findById(quizId);
//     if (!quiz) return res.status(404).json({ error: "Quiz not found" });

//     let correct = 0;
//     quiz.questions.forEach((q) => {
//       const userAnswer = answers.find((a) => a.questionId === q._id.toString());
//       if (userAnswer && userAnswer.selectedOption === q.correctAnswer) {
//         correct++;
//       }
//     });

//     const grade = convertToGrade(correct, quiz.questions.length);

//     const updated = await progressModel.findByIdAndUpdate(
//       progressId,
//       { score: grade, quizTaken: true },
//       { new: true }
//     );

//     if (!updated) return res.status(404).json({ error: "Progress not found" });

//     res.json({
//       message: "Quiz submitted successfully",
//       correct,
//       total: quiz.questions.length,
//       score: grade,
//       progress: updated,
//     });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // 5. Lanjut ke materi berikutnya
// export const goToNextMaterial = async (req, res) => {
//   try {
//     const { progressId } = req.body;

//     const progress = await progressModel.findById(progressId).populate("materialId");
//     if (!progress) return res.status(404).json({ error: "Progress not found" });

//     // cari materi berikutnya berdasarkan id numeric
//     const currentNumericId = progress.materialId.id;
//     const nextMateri = await materialModel.findOne({ id: currentNumericId + 1 });
//     if (!nextMateri) {
//       return res.json({ message: "No more materials, user has finished all." });
//     }

//     // buat progress baru untuk materi berikutnya
//     const newProgress = new progressModel({
//       userId: progress.userId,
//       materialId: nextMateri._id,
//     });
//     const saved = await newProgress.save();

//     // optional: push ke user.progress[]

//     const user = await userModel.findById(progress.userId);
//     if (user) {
//       user.progress.push(newProgress._id);
//       await user.save();
//     }

//     const populated = await progressModel.findById(saved._id).populate("materialId");

//     res.json({ message: "Moved to next material", progress: populated });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

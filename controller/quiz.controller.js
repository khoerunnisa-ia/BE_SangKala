import Quiz from "../models/quiz.model.js";
import Progress from "../models/progress.model.js";
import mongoose from "mongoose";

export const getQuizByMaterial = async (req, res) => {
    try{
    const {materialId} = req.params;
    console.log(">>> Fetching quiz for materialId:", materialId);

    // const quiz = await Quiz.findOne({materialId}).lean();
    // console.log("DEBUG quiz:", quiz);
    
    let quiz = await Quiz.findOne({ materialId }).lean();
        if (!quiz && mongoose.Types.ObjectId.isValid(materialId)) {
            quiz = await Quiz.findOne({ materialId: new mongoose.Types.ObjectId(materialId) }).lean();
        }
        console.log("DEBUG quiz:", quiz);


    if(!quiz){
        return res.status(404).json({message: "quiz not found"});

    }

    if (!mongoose.Types.ObjectId.isValid(materialId)) {
    return res.status(400).json({ message: "Invalid materialId" });
    }

    // res.json(quiz);
    return res.send(JSON.stringify(quiz));
    }catch(e){
        console.error("error fetching quiz", e);
        res.status(500).json({ message: "Server error" });
    }
};

export const submitQuiz = async(req, res) => {
    try{
    const {materialId} = req.params;
    // const {score} = req.body;
    const {answers} = req.body;
    const userId = req.user.id;

     // cari quiz
    // const quiz = await Quiz.findOne({ materialId });
    const quiz = await Quiz.findOne({ materialId: new mongoose.Types.ObjectId(materialId) }).lean();
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let correct = 0;
    quiz.questions.forEach((q) =>{
        const userAns = answers.find(a => String(a.questionId) === String(q._id));
      if (userAns && userAns.selectedOption === q.correctAnswer) {
        correct++;
      }
    })

    const progress = await Progress.findOne({userId, materialId});
    if(!progress){
        return res.status(404).json({ message: "Progress not found" });
    }

    progress.quizTaken = true,
    progress.score = correct;
    progress.done = true;
    await progress.save();

    // res.json({message : "quiz submitted", progress});
    return res.json({
      message : "quiz submitted",
      correct,
      total: quiz.questions.length,
      score: correct,
      quizTaken: true,
    });
    }catch(e){
        console.error("error submitting quiz :", e);
        res.status(500).json({ message: "Server error" });
    }
}
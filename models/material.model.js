import mongoose from "mongoose";

const materiSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    img: {type: String},
    materi: {type: String, required: true},
    description: { type: String }, // new field
    content : [{type: String}],
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz", // referensi ke kuis yang terkait
    },
    
});

export default mongoose.model("Materi", materiSchema);
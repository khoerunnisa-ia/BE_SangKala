import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userId :{type: String, requried: true},
    username : {type: String, required: true, unique: true},
    password : {type: String, required: true},
    email: { type: String, required: true, unique: true },
    progress: { type: mongoose.Schema.Types.ObjectId, ref: "Progress" },
})

export default mongoose.model("User", userSchema);
import userModel from "../models/user.model.js";
import progressModel from "../models/progress.model.js";
import materialModel from "../models/material.model.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const generateUserId = async() => {
    const count = await userModel.countDocuments();
    return `U${(count + 1).toString().padStart(3, "0")}`;
}

//user terkoneksi dengan progress (progress terkoneksi dengan satu materi, otomatis next jika sudah selesai(id materi increasing))
export const createUser = async (req, res) => {
  try {
    console.log("📥 Incoming register:", req.body);

    const { username, email, password } = req.body;
    const existing = await userModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔑 Hashed password generated");

    

    const firstMateri = await materialModel.findOne().sort({ id: 1 });
    console.log("📚 First materi:", firstMateri);

    if (!firstMateri) {
      return res.status(400).json({ error: "Belum ada materi di database" });
    }

    // const progress = new progressModel({ materialId: firstMateri._id });
    // await progress.save();
    // console.log("📈 Progress created:", progress);

    const userId = await generateUserId();
    console.log("🆔 Generated userId:", userId);

    const newUser = new userModel({
      userId,
      username,
      password: hashedPassword,
      email,
    });

    // 2️⃣ buat progress dengan userId
    const progress = new progressModel({
      userId: newUser._id,      // ✅ wajib
      materialId: firstMateri._id,
    });
    await progress.save();

    newUser.progress = progress._id;
    await newUser.save();
    console.log("✅ User created:", newUser);

    //generate jwt
    const token = jwt.sign(
      {userId: newUser.userId, email: newUser.email},
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "7d" }
    )

    res.status(201).json({
      message: "Register succesfull",
      token,
      user: {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        progress: progress,
      }
    });
  } catch (err) {
    console.error("❌ createUser error:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};


// ✅ LOGIN
export const loginUser = async (req, res) => {
  try {
    console.log("📥 Incoming login:", req.body);
    console.log("User schema:", userModel.schema.paths);
    console.log("Progress schema:", progressModel.schema.paths);


    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).populate({
      path: "progress",
      populate: { path: "materialId" },
    });

    console.log("🔍 Found user:", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    console.log("🔑 Password valid?", validPassword);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        progress: user.progress,
      },
    });
  } catch (err) {
    console.error("❌ loginUser error:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};


export const getUser = async(req, res) => {
    try {
            const users = await userModel.find().populate({
            path: "progress",
            populate: { path: "materi" },
            });
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
};

export const findUser = async(req, res)=>{
    try {
        const user = await userModel.findById(req.params.id).populate({
          path: "progress",
          populate: { path: "materi" },
        });
        res.json(user);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
};


import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import chatRoutes from "./routes/ai_route.js";
import userRoutes from "./routes/user_route.js";
import progressRoutes from "./routes/progress_route.js";
import materialRoutes from "./routes/material_route.js";
import quizRoutes from "./routes/quiz_route.js";
// import { PORT } from "./config/config.js";
import { connectDB } from "./models/db.js";

connectDB();


const app = express();

// Middleware
app.use(cors({
  origin: "*", // sementara allow semua
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/quiz", quizRoutes);
//chat di komen dulu
app.use("/api", chatRoutes);

// Root check
// app.get("/", (req, res) => {
//   res.send("Chatbot backend is running 🚀");
// });

// Run server

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

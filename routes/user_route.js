import express from "express";
import { createUser, getUser, findUser, loginUser } from "../controller/user.controller.js";

const router = express.Router();

router.post("/signup", createUser);
router.post("/login", loginUser);
router.get("/", getUser);
router.get("/:id", findUser);

export default router;
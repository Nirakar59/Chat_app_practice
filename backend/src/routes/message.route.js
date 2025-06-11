import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getMessages, getUsersForSiderbar } from "../controllers/message.controller.js";

const router = express.Router()

router.get("/users", protectRoute, getUsersForSiderbar)

router.get("/:id", protectRoute, getMessages)

export default router
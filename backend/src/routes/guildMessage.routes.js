import express from "express"
import { protectRoute } from "../middlewares/auth.middleware.js"
import { deleteChat, getChat, sendMessage } from "../controllers/guildMessage.controller.js"

const router = express.Router()

router.get("/:guildId",protectRoute,getChat)

router.post("/send/:guildId",protectRoute,sendMessage)

router.delete("/delete/:guildId",protectRoute,deleteChat )

export default router
import express from "express"
import { protectRoute } from "../middlewares/auth.middleware.js"
import { addMembers, assignRole, createGuild, deleteGuild } from "../controllers/guild.controller.js"

const router = express.Router()

router.post("/create", protectRoute,createGuild)

router.put("/addmembers", addMembers)

router.put("/assignrole", assignRole)

router.delete("/delete", protectRoute, deleteGuild)

export default router
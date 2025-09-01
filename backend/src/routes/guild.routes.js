import express from "express"
import { protectRoute } from "../middlewares/auth.middleware"
import { addMembers, assignRole, createGuild, deleteGuild } from "../controllers/guild.controller"

const router = express.router()

router.post("/create", protectRoute,createGuild)

router.put("/addmembers", addMembers)

router.put("/assignrole", assignRole)

router.delete("/delete", protectRoute, deleteGuild)

export default router
import express from "express"
import { protectRoute } from "../middlewares/auth.middleware.js"
import { addMembers, assignRole, createGuild, deleteGuild, getAllPublicGuilds, getUsersGuilds } from "../controllers/guild.controller.js"

const router = express.Router()

router.get("/getmyguilds", protectRoute, getUsersGuilds)

router.get("/getpublicguilds", getAllPublicGuilds)

router.post("/create", protectRoute,createGuild)

router.put("/addmembers/:guildId", addMembers)

router.put("/assignrole", assignRole)

router.delete("/delete", protectRoute, deleteGuild)

export default router
import express from "express"
import { protectRoute } from "../middlewares/auth.middleware.js"
import { addMembers, assignRole, createGuild, deleteGuild, getAllPublicGuilds, getGuildByName, getUsersGuilds, joinGuild } from "../controllers/guild.controller.js"

const router = express.Router()

router.get("/getmyguilds", protectRoute, getUsersGuilds)

router.get("/getpublicguilds", getAllPublicGuilds)

router.get("/getbyid/:guildName",getGuildByName)

router.post("/create", protectRoute,createGuild)

router.put("/addmembers/:guildId",protectRoute, addMembers)

router.put("/joinguild/:guildId", protectRoute, joinGuild)

router.put("/assignrole", assignRole)

router.delete("/delete", protectRoute, deleteGuild)

export default router
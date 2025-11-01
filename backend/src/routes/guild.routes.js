import express from "express"
import { protectRoute } from "../middlewares/auth.middleware.js"
import {
    addMembers,
    assignRole,
    createGuild,
    deleteGuild,
    getAllPublicGuilds,
    getGuildByName,
    getUsersGuilds,
    joinGuild,
    updateGuild,
    kickMember,
    getGuildMembers
} from "../controllers/guild.controller.js"

const router = express.Router()

router.get("/getmyguilds", protectRoute, getUsersGuilds)

router.get("/getpublicguilds", getAllPublicGuilds)

router.get("/getbyid/:guildName", getGuildByName)

router.get("/:guildId/members", protectRoute, getGuildMembers)

router.post("/create", protectRoute, createGuild)

router.put("/update/:guildId", protectRoute, updateGuild)

router.put("/addmembers/:guildId", protectRoute, addMembers)

router.put("/joinguild/:guildId", protectRoute, joinGuild)

router.put("/assignrole/:guildId/:targetId", protectRoute, assignRole)

router.delete("/kick/:guildId/:memberId", protectRoute, kickMember)

router.delete("/delete", protectRoute, deleteGuild)

export default router
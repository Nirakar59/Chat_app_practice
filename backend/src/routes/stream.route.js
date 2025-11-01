import express from "express"
import {
    startStream,
    getPublicStreams,
    getGuildStreams,
    stopStream,
    joinStream,
    leaveStream,
    sendChatMessage,
    getStreamChat,
    getStreamById
} from "../controllers/stream.controller.js"
import { protectRoute } from "../middlewares/auth.middleware.js"

const router = express.Router()

// Start a new stream
router.post("/start", protectRoute, startStream)

// Get all public streams (excluding own)
router.get("/public", protectRoute, getPublicStreams)

// Get guild-specific streams
router.get("/guild/:guildId", protectRoute, getGuildStreams)

// Get stream by ID
router.get("/:streamId", protectRoute, getStreamById)

// Stop stream
router.delete("/:streamId/stop", protectRoute, stopStream)

// Join stream
router.post("/:streamId/join", protectRoute, joinStream)

// Leave stream
router.post("/:streamId/leave", protectRoute, leaveStream)

// Stream chat
router.post("/:streamId/chat", protectRoute, sendChatMessage)
router.get("/:streamId/chat", protectRoute, getStreamChat)

export default router
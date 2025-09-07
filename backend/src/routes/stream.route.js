import express from "express"
import { getPublicStream, startStream } from "../controllers/stream.controller.js"
import { protectRoute } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/start-stream", startStream)

router.get("/get-public-stream", protectRoute, getPublicStream )

export default router
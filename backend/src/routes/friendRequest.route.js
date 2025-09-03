import express from "express"
import { protectRoute } from "../middlewares/auth.middleware.js"
import { acceptRequest, cancelRequest, deleteRequest, getPendingRequests, sendRequest } from "../controllers/friendRequest.controller.js"

const router = express.Router()

router.post("/send-request/:id",protectRoute,sendRequest)

router.get("/getpending-request",protectRoute,getPendingRequests)

router.put("/accept-request",acceptRequest)

router.delete("/delete-request/:id",protectRoute,deleteRequest)

router.delete("/cancel-request/:targetId/:reqId",cancelRequest )
export default router 
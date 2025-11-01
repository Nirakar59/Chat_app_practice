import express from "express"
import { protectRoute } from "../middlewares/auth.middleware.js"
import {
    acceptRequest,
    cancelRequest,
    deleteRequest,
    getPendingRequests,
    getSentRequests,
    sendRequest,
    searchUsers,
    getFriends,
    removeFriend
} from "../controllers/friendRequest.controller.js"

const router = express.Router()

// Send friend request
router.post("/send-request/:targetId", protectRoute, sendRequest)

// Get pending requests (received)
router.get("/getpending-request", protectRoute, getPendingRequests)

// Get sent requests
router.get("/sent-requests", protectRoute, getSentRequests)

// Accept friend request
router.put("/accept-request", protectRoute, acceptRequest)

// Delete/reject request
router.delete("/delete-request/:reqID", protectRoute, deleteRequest)

// Cancel sent request
router.delete("/cancel-request/:targetId/:reqId", protectRoute, cancelRequest)

// Search users
router.get("/search", protectRoute, searchUsers)

// Get friends list
router.get("/friends", protectRoute, getFriends)

// Remove friend
router.delete("/remove-friend/:friendId", protectRoute, removeFriend)

export default router
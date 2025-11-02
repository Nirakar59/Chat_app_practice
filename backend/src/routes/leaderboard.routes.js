import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
    getLeaderboard,
    addLeaderboardEntry,
    updateLeaderboardPosition,
    removeLeaderboardEntry,
    createBadge,
    awardBadge,
    removeBadgeFromUser,
    createAnnouncement,
    deleteAnnouncement,
    togglePinAnnouncement
} from "../controllers/leaderboard.controller.js";

const router = express.Router();

// Leaderboard routes
router.get("/:guildId", protectRoute, getLeaderboard);
router.post("/:guildId/entry", protectRoute, addLeaderboardEntry);
router.put("/:guildId/entry/:userId/position", protectRoute, updateLeaderboardPosition);
router.delete("/:guildId/entry/:userId", protectRoute, removeLeaderboardEntry);

// Badge routes
router.post("/:guildId/badge", protectRoute, createBadge);
router.post("/:guildId/badge/award/:userId", protectRoute, awardBadge);
router.delete("/:guildId/badge/:badgeId/user/:userId", protectRoute, removeBadgeFromUser);

// Announcement routes
router.post("/:guildId/announcement", protectRoute, createAnnouncement);
router.delete("/:guildId/announcement/:announcementId", protectRoute, deleteAnnouncement);
router.put("/:guildId/announcement/:announcementId/pin", protectRoute, togglePinAnnouncement);

export default router;
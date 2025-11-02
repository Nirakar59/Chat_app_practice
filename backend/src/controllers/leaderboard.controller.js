import GuildLeaderboard from "../models/guildLeaderboard.model.js";
import Guild from "../models/guild.model.js";
import cloudinary from "../lib/cloudinary.js";

// Helper function to check if user is GM or Vice GM
const checkPermissions = async (guildId, userId) => {
    const guild = await Guild.findById(guildId);
    if (!guild) throw new Error("Guild not found");

    const member = guild.members.find(m => m.member.toString() === userId.toString());
    if (!member || (member.role !== "GuildMaster" && member.role !== "Vice-GuildMaster")) {
        throw new Error("Only GuildMaster or Vice-GuildMaster can perform this action");
    }

    return { guild, member };
};

// ============ LEADERBOARD MANAGEMENT ============

export const getLeaderboard = async (req, res) => {
    try {
        const { guildId } = req.params;

        let leaderboard = await GuildLeaderboard.findOne({ guildId })
            .populate('leaderboard.userId', 'fullName email profilePic')
            .populate('announcements.createdBy', 'fullName profilePic')
            .populate('badges.createdBy', 'fullName');

        if (!leaderboard) {
            // Create a new leaderboard if it doesn't exist
            leaderboard = new GuildLeaderboard({ guildId, leaderboard: [], badges: [], announcements: [] });
            await leaderboard.save();
        }

        res.status(200).json({ leaderboard });
    } catch (error) {
        console.log("Error getting leaderboard:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const addLeaderboardEntry = async (req, res) => {
    try {
        const { guildId } = req.params;
        const { userId, gamerTag } = req.body;
        const requesterId = req.user._id;

        await checkPermissions(guildId, requesterId);

        let leaderboard = await GuildLeaderboard.findOne({ guildId });
        if (!leaderboard) {
            leaderboard = new GuildLeaderboard({ guildId, leaderboard: [], badges: [], announcements: [] });
        }

        // Check if user already exists
        const existingEntry = leaderboard.leaderboard.find(
            entry => entry.userId.toString() === userId.toString()
        );

        if (existingEntry) {
            return res.status(400).json({ message: "User already exists in leaderboard" });
        }

        // Add new entry at the end
        const newPosition = leaderboard.leaderboard.length + 1;
        leaderboard.leaderboard.push({
            userId,
            gamerTag,
            position: newPosition,
            points: 0,
            badges: []
        });

        await leaderboard.save();
        await leaderboard.populate('leaderboard.userId', 'fullName email profilePic');

        res.status(200).json({
            message: "Entry added to leaderboard",
            leaderboard
        });
    } catch (error) {
        console.log("Error adding leaderboard entry:", error.message);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

export const updateLeaderboardPosition = async (req, res) => {
    try {
        const { guildId, userId } = req.params;
        const { direction } = req.body; // 'up' or 'down'
        const requesterId = req.user._id;

        await checkPermissions(guildId, requesterId);

        const leaderboard = await GuildLeaderboard.findOne({ guildId });
        if (!leaderboard) {
            return res.status(404).json({ message: "Leaderboard not found" });
        }

        const entryIndex = leaderboard.leaderboard.findIndex(
            entry => entry.userId.toString() === userId.toString()
        );

        if (entryIndex === -1) {
            return res.status(404).json({ message: "User not found in leaderboard" });
        }

        const currentPosition = leaderboard.leaderboard[entryIndex].position;

        if (direction === 'up') {
            if (currentPosition === 1) {
                return res.status(400).json({ message: "Already at top position" });
            }

            // Find the entry above and swap positions
            const swapIndex = leaderboard.leaderboard.findIndex(
                entry => entry.position === currentPosition - 1
            );

            if (swapIndex !== -1) {
                leaderboard.leaderboard[swapIndex].position = currentPosition;
                leaderboard.leaderboard[entryIndex].position = currentPosition - 1;
            }
        } else if (direction === 'down') {
            if (currentPosition === leaderboard.leaderboard.length) {
                return res.status(400).json({ message: "Already at bottom position" });
            }

            // Find the entry below and swap positions
            const swapIndex = leaderboard.leaderboard.findIndex(
                entry => entry.position === currentPosition + 1
            );

            if (swapIndex !== -1) {
                leaderboard.leaderboard[swapIndex].position = currentPosition;
                leaderboard.leaderboard[entryIndex].position = currentPosition + 1;
            }
        }

        await leaderboard.save();
        await leaderboard.populate('leaderboard.userId', 'fullName email profilePic');

        res.status(200).json({
            message: "Position updated",
            leaderboard
        });
    } catch (error) {
        console.log("Error updating position:", error.message);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

export const removeLeaderboardEntry = async (req, res) => {
    try {
        const { guildId, userId } = req.params;
        const requesterId = req.user._id;

        await checkPermissions(guildId, requesterId);

        const leaderboard = await GuildLeaderboard.findOne({ guildId });
        if (!leaderboard) {
            return res.status(404).json({ message: "Leaderboard not found" });
        }

        const entryIndex = leaderboard.leaderboard.findIndex(
            entry => entry.userId.toString() === userId.toString()
        );

        if (entryIndex === -1) {
            return res.status(404).json({ message: "User not found in leaderboard" });
        }

        const removedPosition = leaderboard.leaderboard[entryIndex].position;
        leaderboard.leaderboard.splice(entryIndex, 1);

        // Reorder positions
        leaderboard.leaderboard.forEach(entry => {
            if (entry.position > removedPosition) {
                entry.position -= 1;
            }
        });

        await leaderboard.save();

        res.status(200).json({
            message: "Entry removed from leaderboard",
            leaderboard
        });
    } catch (error) {
        console.log("Error removing entry:", error.message);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

// ============ BADGE MANAGEMENT ============

export const createBadge = async (req, res) => {
    try {
        const { guildId } = req.params;
        const { name, image, description } = req.body;
        const requesterId = req.user._id;

        await checkPermissions(guildId, requesterId);

        let leaderboard = await GuildLeaderboard.findOne({ guildId });
        if (!leaderboard) {
            leaderboard = new GuildLeaderboard({ guildId, leaderboard: [], badges: [], announcements: [] });
        }

        // Upload image to cloudinary
        let imageUrl = image;
        if (image && image.startsWith('data:image')) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newBadge = {
            name,
            image: imageUrl,
            description,
            createdBy: requesterId
        };

        leaderboard.badges.push(newBadge);
        await leaderboard.save();

        res.status(201).json({
            message: "Badge created successfully",
            badge: leaderboard.badges[leaderboard.badges.length - 1]
        });
    } catch (error) {
        console.log("Error creating badge:", error.message);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

export const awardBadge = async (req, res) => {
    try {
        const { guildId, userId } = req.params;
        const { badgeId } = req.body;
        const requesterId = req.user._id;

        await checkPermissions(guildId, requesterId);

        const leaderboard = await GuildLeaderboard.findOne({ guildId });
        if (!leaderboard) {
            return res.status(404).json({ message: "Leaderboard not found" });
        }

        const badge = leaderboard.badges.id(badgeId);
        if (!badge) {
            return res.status(404).json({ message: "Badge not found" });
        }

        const entry = leaderboard.leaderboard.find(
            e => e.userId.toString() === userId.toString()
        );

        if (!entry) {
            return res.status(404).json({ message: "User not found in leaderboard" });
        }

        // Check if badge already awarded
        const alreadyAwarded = entry.badges.some(
            b => b.badgeId.toString() === badgeId.toString()
        );

        if (alreadyAwarded) {
            return res.status(400).json({ message: "Badge already awarded to this user" });
        }

        entry.badges.push({
            badgeId: badge._id,
            badgeName: badge.name,
            badgeImage: badge.image,
            awardedBy: requesterId
        });

        await leaderboard.save();
        await leaderboard.populate('leaderboard.userId', 'fullName email profilePic');

        res.status(200).json({
            message: "Badge awarded successfully",
            leaderboard
        });
    } catch (error) {
        console.log("Error awarding badge:", error.message);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

export const removeBadgeFromUser = async (req, res) => {
    try {
        const { guildId, userId, badgeId } = req.params;
        const requesterId = req.user._id;

        await checkPermissions(guildId, requesterId);

        const leaderboard = await GuildLeaderboard.findOne({ guildId });
        if (!leaderboard) {
            return res.status(404).json({ message: "Leaderboard not found" });
        }

        const entry = leaderboard.leaderboard.find(
            e => e.userId.toString() === userId.toString()
        );

        if (!entry) {
            return res.status(404).json({ message: "User not found in leaderboard" });
        }

        entry.badges = entry.badges.filter(
            b => b.badgeId.toString() !== badgeId.toString()
        );

        await leaderboard.save();

        res.status(200).json({
            message: "Badge removed successfully",
            leaderboard
        });
    } catch (error) {
        console.log("Error removing badge:", error.message);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

// ============ ANNOUNCEMENT MANAGEMENT ============

export const createAnnouncement = async (req, res) => {
    try {
        const { guildId } = req.params;
        const { title, content, isPinned } = req.body;
        const requesterId = req.user._id;

        await checkPermissions(guildId, requesterId);

        let leaderboard = await GuildLeaderboard.findOne({ guildId });
        if (!leaderboard) {
            leaderboard = new GuildLeaderboard({ guildId, leaderboard: [], badges: [], announcements: [] });
        }

        const newAnnouncement = {
            title,
            content,
            createdBy: requesterId,
            isPinned: isPinned || false
        };

        leaderboard.announcements.unshift(newAnnouncement); // Add to beginning
        await leaderboard.save();
        await leaderboard.populate('announcements.createdBy', 'fullName profilePic');

        res.status(201).json({
            message: "Announcement created successfully",
            announcement: leaderboard.announcements[0]
        });
    } catch (error) {
        console.log("Error creating announcement:", error.message);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const { guildId, announcementId } = req.params;
        const requesterId = req.user._id;

        await checkPermissions(guildId, requesterId);

        const leaderboard = await GuildLeaderboard.findOne({ guildId });
        if (!leaderboard) {
            return res.status(404).json({ message: "Leaderboard not found" });
        }

        const announcement = leaderboard.announcements.id(announcementId);
        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        announcement.deleteOne();
        await leaderboard.save();

        res.status(200).json({ message: "Announcement deleted successfully" });
    } catch (error) {
        console.log("Error deleting announcement:", error.message);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

export const togglePinAnnouncement = async (req, res) => {
    try {
        const { guildId, announcementId } = req.params;
        const requesterId = req.user._id;

        await checkPermissions(guildId, requesterId);

        const leaderboard = await GuildLeaderboard.findOne({ guildId });
        if (!leaderboard) {
            return res.status(404).json({ message: "Leaderboard not found" });
        }

        const announcement = leaderboard.announcements.id(announcementId);
        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        announcement.isPinned = !announcement.isPinned;
        await leaderboard.save();
        await leaderboard.populate('announcements.createdBy', 'fullName profilePic');

        res.status(200).json({
            message: `Announcement ${announcement.isPinned ? 'pinned' : 'unpinned'}`,
            leaderboard
        });
    } catch (error) {
        console.log("Error toggling pin:", error.message);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
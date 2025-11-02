import mongoose from "mongoose";

const leaderboardEntrySchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    gamerTag: {
        type: String,
        required: true
    },
    position: {
        type: Number,
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    badges: [{
        badgeId: {
            type: mongoose.Schema.Types.ObjectId
        },
        badgeName: String,
        badgeImage: String,
        awardedAt: {
            type: Date,
            default: Date.now
        },
        awardedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }]
});

const badgeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const announcementSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const guildLeaderboardSchema = mongoose.Schema({
    guildId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Guild",
        required: true,
        unique: true
    },
    leaderboard: [leaderboardEntrySchema],
    badges: [badgeSchema],
    announcements: [announcementSchema]
}, {
    timestamps: true
});

const GuildLeaderboard = mongoose.model("GuildLeaderboard", guildLeaderboardSchema);

export default GuildLeaderboard;
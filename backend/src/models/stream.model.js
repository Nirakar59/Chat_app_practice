import mongoose from "mongoose";
import User from "./user.model.js";

const chatSchema = mongoose.Schema({
    streamId: { type: mongoose.Schema.Types.ObjectId, ref: "Stream" },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: String,
}, { timestamps: true })

const streamSchema =  mongoose.Schema(
    {
        hostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title:{
            type: String,
            default: "Untitled Stream"
        },

        description:{
            type: String
        },

        streamType: {
            type: String,
            enum: ["Public", "Guild-Based"],
            default: "Live"
        },

        category: {
            type: String,
            enum: ["Gaming", "Education", "Music"]
        },

        roomId: {
            type: String,
            required: true
        },

        viewerCount: {
            type: Number,
            required: true,
            default: 0
        },

        viewers: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            joinedAt: { type: Date, default: Date.now }
        }],

        thumbnailUrl: {
            type: String,
            default:""
        },

        chat: {
            type: [chatSchema]
        },

        producerId: {       // link to WebRTC producer track if needed
            type: String
        } 


    },
    {
        timestamps: true
    }
)

const Stream = mongoose.model("Stream",streamSchema)

export default Stream
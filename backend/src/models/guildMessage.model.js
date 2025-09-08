import mongoose from "mongoose";

const guildMessageSchema =  mongoose.Schema(
    {
        guildId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Guild",
            required: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        message: {
            type:String,
        },
        image: {
            type: String,
            default: ''
        }
    },
    { timestamps: true }
);

const GuildMessage = mongoose.model("GuildMessage", guildMessageSchema);

export default GuildMessage;

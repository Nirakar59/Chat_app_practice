import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Guild from "../models/guild.model.js";
import GuildMessage from "../models/guildMessage.model.js";

export const getChat = async(req,res) => {
    try{
        
        const user = req.user
        const {guildId} = req.params

        const guild = await Guild.findById(guildId)

        if(!guild) return res.status(400).json({message:"Guild doesn't exist"})

        const alreadyMember = guild.members.some(
            (m) => m.member.toString() === user._id.toString()
        )

        if(!alreadyMember) return res.status(400).json({message:`You are not a member of ${guild.guildName} `})

        const chat = await GuildMessage.find({ guildId })
            .populate("senderId", "fullName profilePic")
            .sort({ createdAt: 1 });

        res.status(200).json({chat})
        
    }
    catch(error){
        console.log("Error getting the chat: ", error.message);
        res.status(500).json({message: "Internal Server Error in getting the chat"})
    }
}

export const sendMessage = async(req,res) => {
    try {
        const user = req.user
        const {text, img} = req.body
        const {guildId} = req.params

        let imgUrl

        if(img){
            const uploadResponse = await cloudinary.uploader.upload(img)
            imgUrl = uploadResponse.secure_url
        }

        let newMessage = new GuildMessage({
            guildId,
            senderId: user._id,
            text: text,
            image: imgUrl
        })

        await newMessage.save()

        newMessage = await newMessage.populate("senderId", "fullName profilePic")

        io.to(guildId).emit("newMessageForGuild", newMessage)
        const sId = getReceiverSocketId(user._id)
        console.log(`Mssg emitted from user : ${sId} guild with id : ${guildId}`)


        res.status(200).json({newMessage})
    }
    catch (error) {
        console.log("Error sending the message: ", error.message);
        res.status(500).json({ message: "Internal Server Error in sending the message" })
    }
}

export const deleteChat = async (req, res) => {

    try {
        const userId = req.user._id
        const { guildId} = req.params

        const guild = await Guild.findOne(
            { _id: guildId },
            { members: { $elemMatch: { role: "GuildMaster" } } }
        ).populate("members.member")

        const guildMaster = guild.members[0].member

        if (!((guildMaster._id).equals(userId))) return res.status(400).json("Only the guild master can Delete the chat")

        const deletedMessage = await GuildMessage.deleteMany({guildId})
        const count = deletedMessage.deletedCount ?? result.n ?? 0;
        res.status(200).json(
            {
                message: `${count} messages deleted succesfully`
            }
        )

    }
    catch (err) {
        console.log("Error deleting chat: ", err.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
} 
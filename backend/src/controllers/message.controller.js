import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId, io } from "../lib/socket.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"

export const getUsersForSiderbar = async (req, res) => {
    try {
        const loggerInUserId = req.user._id
        const filteredUsers = await User.find({ _id: { $ne: loggerInUserId } }).select("-password")

        res.status(200).json(filteredUsers)
    } catch (error) {
        console.log("Error getting Users: ", error.message);
        res.status(500).json({ message: "Internal server error" })

    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params
        const myId = req.user._id

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })

        res.status(200).json(messages)
    } catch (error) {
        console.log("Error getting messages: ", error.message);
        res.status(200).json({ message: "Internal Server Error" })
    }
}

export const sendMessage = async (req, res) => {
 
    try {
        const { text, image } = req.body
        const {id: receiverId} = req.params
        const senderId = req.user._id

        let imageUrl

        if(image){       
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }

        const newMessage =  new Message(
            {
                senderId,
                receiverId,
                text,
                image: imageUrl
            }
        )

        await newMessage.save()

        const receiverSocketId = getReceiverSocketId(receiverId)
        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }

        res.status(201).json(newMessage)

    } catch (error) {
        console.log("Error sending messages: ", error.message);
        res.status(500).json({ message: "" })
    }
}

export const deleteMessage = async(req,res)=>{

    try{
        const userId = req.user._id
        const {id:userToDeleteId} = req.params

        const deletedMessage = await Message.deleteMany(
            {
                $or: [
                    { senderId: userId, receiverId:userToDeleteId},
                    { senderId: userToDeleteId, receiverId:userId}
                ]
            }
        )
        const count = deletedMessage.deletedCount ?? result.n ?? 0;
        res.status(200).json(
            {
                message:`${count} messages deleted succesfully`
            }
        )

    }
    catch(err){
        console.log("Error deleting messages: ", err.message )
        res.status(500).json({message:"Internal Server Error"})
    }
}
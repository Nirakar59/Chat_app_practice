import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId, io } from "../lib/socket.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"

export const getUsersForSiderbar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id

        // Get the user with their friend list
        const user = await User.findById(loggedInUserId)
            .populate('friendList', 'fullName email profilePic')

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // Return only friends
        res.status(200).json(user.friendList || [])
    } catch (error) {
        console.log("Error getting Users: ", error.message);
        res.status(500).json({ message: "Internal server error" })
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params
        const myId = req.user._id

        // Verify they are friends before fetching messages
        const user = await User.findById(myId)
        if (!user.friendList.includes(userToChatId)) {
            return res.status(403).json({ message: "You can only message friends" })
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })

        res.status(200).json(messages)
    } catch (error) {
        console.log("Error getting messages: ", error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body
        const { id: receiverId } = req.params
        const senderId = req.user._id

        // Verify they are friends before sending message
        const user = await User.findById(senderId)
        if (!user.friendList.includes(receiverId)) {
            return res.status(403).json({ message: "You can only message friends" })
        }

        let imageUrl
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        await newMessage.save()

        const receiverSocketId = getReceiverSocketId(receiverId)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error sending messages: ", error.message);
        res.status(500).json({ message: "Failed to send message" })
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const userId = req.user._id
        const { id: userToDeleteId } = req.params

        const deletedMessage = await Message.deleteMany({
            $or: [
                { senderId: userId, receiverId: userToDeleteId },
                { senderId: userToDeleteId, receiverId: userId }
            ]
        })

        const count = deletedMessage.deletedCount ?? 0
        res.status(200).json({
            message: `${count} messages deleted successfully`
        })
    } catch (err) {
        console.log("Error deleting messages: ", err.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}
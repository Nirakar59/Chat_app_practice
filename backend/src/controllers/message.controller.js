import Message from "../models/message.model.js"
import User from "../models/user.model.js"

export const getUsersForSiderbar = async (req, res) => {
    try {
        const loggerInUserId = req.user._id
        const filteredUsers = await User.find({ _id: { ne: loggerInUserId } }).select("-password")

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

    const { text, image } = req.body

    try {

    } catch (error) {
        console.log("Error sending messages: ", error.message);
        res.status(500).json({ message: "" })
    }
}
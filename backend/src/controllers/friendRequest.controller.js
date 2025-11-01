import FriendRequest from "../models/friendRequset.model.js"
import User from "../models/user.model.js"

export const sendRequest = async (req, res) => {
    try {
        const user = req.user
        const { targetId } = req.params

        if (!user._id || !targetId) return res.status(400).json({ message: "Selected Or Targeted user doesn't exist" })

        // Check if already friends
        const sender = await User.findById(user._id)
        if (sender.friendList.includes(targetId)) {
            return res.status(400).json({ message: "Already friends with this user" })
        }

        // Check if request already exists
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { requestSender: user._id, requestRecipient: targetId },
                { requestSender: targetId, requestRecipient: user._id }
            ],
            status: "pending"
        })

        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already exists" })
        }

        const newRequest = new FriendRequest({
            requestSender: user._id,
            requestRecipient: targetId,
            status: "pending"
        })

        if (newRequest) {
            await newRequest.save()
        }

        const updatedRecipient = await User.findByIdAndUpdate(
            targetId,
            { $addToSet: { pendingRequests: newRequest._id } },
            { new: true }
        )

        res.status(200).json({
            message: "Friend Request Sent",
            recipient: updatedRecipient
        })

    } catch (error) {
        console.log("Error in create request: ", error.message);
        res.status(500).json({ message: "Internal Server Error Creating a friend request" })
    }
}

export const getPendingRequests = async (req, res) => {
    try {
        const user = req.user

        const pendingReqs = await FriendRequest.find({
            requestRecipient: user._id,
            status: "pending"
        })
            .populate('requestSender', 'fullName email profilePic')
            .sort({ createdAt: -1 })

        if (pendingReqs.length === 0) {
            return res.status(400).json({ message: "No pending requests" })
        }

        res.status(200).json({
            pendingReqs
        })
    }
    catch (error) {
        console.log("Error fetching all pending Requests: ", error.message);
        res.status(500).json({ message: "Internal Server Error in fetching Requests" })
    }
}

export const getSentRequests = async (req, res) => {
    try {
        const user = req.user

        const sentRequests = await FriendRequest.find({
            requestSender: user._id,
            status: "pending"
        })
            .populate('requestRecipient', 'fullName email profilePic')
            .sort({ createdAt: -1 })

        res.status(200).json({
            sentRequests
        })
    } catch (error) {
        console.log("Error fetching sent requests: ", error.message);
        res.status(500).json({ message: "Internal Server Error in fetching sent requests" })
    }
}

export const acceptRequest = async (req, res) => {
    try {
        const { reqId } = req.body
        const Request = await FriendRequest.findById(reqId)

        if (!Request) {
            return res.status(404).json({ message: "Request not found" })
        }

        const senderID = Request.requestSender
        const recipientID = Request.requestRecipient

        const senderFriendUpdate = await User.findByIdAndUpdate(
            senderID,
            { $addToSet: { friendList: recipientID } },
            { new: true }
        )

        const recipientFriendUpdate = await User.findByIdAndUpdate(
            recipientID,
            { $addToSet: { friendList: senderID }, $pull: { pendingRequests: reqId } },
            { new: true }
        )

        const acceptedStatus = await FriendRequest.findByIdAndUpdate(
            reqId,
            { status: "accepted" },
            { new: true }
        )

        res.status(200).json({
            message: "Request Accepted!!",
            senderFriendUpdate,
            recipientFriendUpdate,
            acceptedStatus
        })

    } catch (error) {
        console.log("Error accepting request: ", error.message);
        res.status(500).json({ message: "Internal Server error in accepting request" })
    }
}

export const deleteRequest = async (req, res) => {
    try {
        const { reqID } = req.params
        const user = req.user

        const Request = await FriendRequest.findById(reqID)
        if (!Request) return res.status(404).json({ message: "The request has already been deleted or hasn't been made yet!" })

        await FriendRequest.deleteOne({ _id: reqID })

        await User.findByIdAndUpdate(
            user._id,
            { $pull: { pendingRequests: reqID } }
        )
        res.status(200).json({ message: "Request Deleted" })
    } catch (error) {
        console.log("Error deleting the request: ", error.message);
        res.status(500).json({ message: "Internal Server Error deleting the request" })
    }
}

export const cancelRequest = async (req, res) => {
    try {
        const { targetId, reqId } = req.params

        const Request = await FriendRequest.findById(reqId)
        if (!Request) return res.status(404).json({ message: "The request has already been cancelled" })

        await FriendRequest.deleteOne({ _id: reqId })

        await User.findByIdAndUpdate(
            targetId,
            { $pull: { pendingRequests: reqId } }
        )
        res.status(200).json({ message: "Request Cancelled" })
    } catch (error) {
        console.log("Error cancelling request: ", error.message);
        res.status(500).json({ message: "Internal Server Error in cancelling request" })
    }
}

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query
        const currentUserId = req.user._id

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ message: "Search query is required" })
        }

        // Search by name or email (case insensitive)
        const users = await User.find({
            $and: [
                { _id: { $ne: currentUserId } }, // Exclude current user
                {
                    $or: [
                        { fullName: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        })
            .select('fullName email profilePic')
            .limit(20)

        res.status(200).json({
            users
        })
    } catch (error) {
        console.log("Error searching users: ", error.message);
        res.status(500).json({ message: "Internal Server Error in searching users" })
    }
}

export const getFriends = async (req, res) => {
    try {
        const userId = req.user._id

        const user = await User.findById(userId)
            .populate('friendList', 'fullName email profilePic')

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json({
            friends: user.friendList
        })
    } catch (error) {
        console.log("Error getting friends: ", error.message);
        res.status(500).json({ message: "Internal Server Error in getting friends" })
    }
}

export const removeFriend = async (req, res) => {
    try {
        const userId = req.user._id
        const { friendId } = req.params

        // Remove from both users' friend lists
        await User.findByIdAndUpdate(
            userId,
            { $pull: { friendList: friendId } }
        )

        await User.findByIdAndUpdate(
            friendId,
            { $pull: { friendList: userId } }
        )

        // Update friend request status to 'removed' if exists
        await FriendRequest.updateMany(
            {
                $or: [
                    { requestSender: userId, requestRecipient: friendId },
                    { requestSender: friendId, requestRecipient: userId }
                ],
                status: "accepted"
            },
            { status: "removed" }
        )

        res.status(200).json({
            message: "Friend removed successfully"
        })
    } catch (error) {
        console.log("Error removing friend: ", error.message);
        res.status(500).json({ message: "Internal Server Error in removing friend" })
    }
}
import FriendRequest from "../models/friendRequset.model.js"
import User from "../models/user.model.js"

export const sendRequest = async(req,res)=>{
    try {
        const user = req.user
        const {targetId} = req.params

        if(!user._id || !targetId) return res.status(400).json({message:"Selected Or Targeted user doesn't exist"})
        
        const newRequest = new FriendRequest({
            requestSender : user._id,
            requestRecipient: targetId,
            status: "pending"
        })

        const sender = await User.findById(user._id)

        //Todo using sender id to :
        // socket.to(sender).emit("send-request", "FriendRequest sent")

        if(newRequest){
            await newRequest.save()
        }

       const updatedRecipient =  await User.findByIdAndUpdate(
            targetId,
            {$addToSet:{pendingRequests: newRequest._id}},
            {new:true}
        )

        res.status(200).json({message:"Friend Request Sent"},
            {recipient: updatedRecipient}
        )

    } catch (error) {
        console.log("Error in create request: ", error.message);
        res.status(500).json({message:"Internal Server Error Creating a friend request"})
    }
}

export const getPendingRequests = (req,res) => {
    try{

        const user = req.user
        const pendingReqs = user.pendingRequests
        if(pendingReqs.length === 0) return res.status(400).json({message: "No pending requests"})

        res.status(200).json({
            pendingReqs
        })
    }
    catch(error){
        console.log("Error fetching all pending Requests: ", error.message);
        res.status(500).json({message: "Internal Server Error in fetching Requests"})
        
    }
}

export const acceptRequest = async(req,res) => {
    try {
        const {reqId} = req.body
        const Requeset = await FriendRequest.findById(reqId)

        const senderID = Requeset.requestSender
        const recipientID = Requeset.requestRecipient

        const senderFriendUpdate = await User.findByIdAndUpdate(
            senderID,
            {$addToSet: {friendList : recipientID}},
            {new:true}
        )

        const recipientFriendUpdate =await User.findByIdAndUpdate(
            recipientID,
            {$addToSet: {friendList: senderID}, $pull:{pendingRequests: reqId}},
            {new: true}
        )

        const acceptedStatus = await FriendRequest.findByIdAndUpdate(
            reqId,
            {status: "Accepted"},
            {new:true}
        )

        res.status(200).json(
            { message: "Request Accepted!!" },
            senderFriendUpdate,
            recipientFriendUpdate,
            acceptedStatus
        )
        
    } catch (error) {
        console.log("Error accepting request: ", error.message);
        res.status(500).json({message: "Internal Server error in accepting request"})
        
    }
}

export const deleteRequest = async(req,res) => {
    try {
        const {reqID} = req.params
        const user = req.user 

        const Request = await FriendRequest.findById(reqID)
        if (!Request) return res.status(500).json({ message:"The request has already been deleted or haven't been made yet!" })

        await FriendRequest.deleteOne({_id:reqID})

        await User.findByIdAndUpdate(
            user._id,
            {$pull: {pendingRequests: reqID}}
        )
        res.status(200).json({message: "Request Deleted"})
    } catch (error) {
        console.log("Error deleting the request: ", error.message);
        res.status(500).json({message: "Internal Server Error deleting the request"})
    }
}

export const cancelRequest = async(req,res) => {
    try {
        const { targetId, reqId } = req.params

        const Request = await FriendRequest.findById(reqId)
        if (!Request) return res.status(500).json({ message: "The request has already been canclled " })

        await FriendRequest.deleteOne({ _id: reqId })

        await User.findByIdAndUpdate(
            targetId,
            { $pull: { pendingRequests: reqId } }
        )
        res.status(200).json({ message: "Request Deleted" })
    } catch (error) {
        console.log("Error cancelling request: ", error.message);
        res.status(500).json({message: "Internal Server Error in calcelling request"})
    }
}
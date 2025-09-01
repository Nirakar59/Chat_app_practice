import mongoose from "mongoose";
import User from "./user.model";

const friendRequestSchema = mongoose.Schema(
    {

        requestSender:{
            type: mongoose.Schema.Types.ObjectId,
            ref:User,
            required: true
        },

        requestRecipient:{
            type: mongoose.Schema.Types.ObjectId,
            ref: User,
            required: true
        },

        status:{
            type: String,
            enum: ['pending', 'accepted', 'blocked'],
            default: 'pending'
        }

    },
    {
        timestamps: true
    }
)

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema)

export default Friendship
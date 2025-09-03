import mongoose from "mongoose"
import Guild from "./guild.model.js"
import FriendRequest from "./friendRequset.model.js"

const UserSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            minlength: 8
        },
        fullName: {
            type: String,
            required: true
        },
        profilePic: {
            type: String,
            default: ''
        },
        affiliatedGuilds:{
            type:[mongoose.Schema.Types.ObjectId],
            ref: Guild
        },
        pendingRequests: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: FriendRequest
        },
        friendList: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model("User", UserSchema)

export default User
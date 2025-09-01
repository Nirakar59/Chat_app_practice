import mongoose from "mongoose"
import Guild from "./guild.model"

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
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model("User", UserSchema)

export default User
import mongoose from "mongoose";
import User from "./user.model.js";

const membersSchema = mongoose.Schema(
    {
        member:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
            role: {
            type: String,
            enum: ['GuildMaster', 'Vice-GuildMaster', 'Streamer', 'GuildMember'],
            default: "GuildMember"
        },
    }
)

const guildSchema = mongoose.Schema(
    {
        members:{
            type:[membersSchema]
        },
        
        guildName: {
            type: String,
            required: true,
            unique:true
        },

        guildIcon: {
            type: String
        },

        guildType:{
            type:String,
            emum:['public', 'private']
        }
        

    },
    {
        timestamps: true
    }
)

guildSchema.post("save", async function (doc) {
    try {
        const guildId = doc._id;
        const memberIds = doc.members.map(m => m.member);

        // For each member, push this guildId into their affiliatedGuilds
        await User.updateMany(
            { _id: { $in: memberIds } },
            { $addToSet: { affiliatedGuilds: guildId } } // addToSet avoids duplicates
        );
    } catch (err) {
        console.error("Error syncing affiliatedGuilds:", err.message);
    }
});


const Guild =  mongoose.model("Guild", guildSchema)

export default Guild
import Guild from "../models/guild.model.js"
import User from "../models/user.model.js"

export const createGuild =  async(req,res) =>{
    const {guildName, guildIcon} = req.body

    try{
        const user = req.user
        // const createrId = req.user._id
        const{guildName, guildIcon, guildType} = req.body

        if(!guildName || !guildType) return res.status(400).json({message: "Missing guild credentials !"})

        const exists = await Guild.findOne({guildName})
        if(exists) return res.status(400).json({message: "Name already exists"});

        const newGuild = new Guild({
            guildName,
            guildType,
            guildIcon,
            members:[{member:user._id, role:"GuildMaster"}]
        })

        if(newGuild){
            await newGuild.save();

        await User.findByIdAndUpdate(
            user._id,
            { $push: {affiliatedGuilds: newGuild._id} },
            {new: true}
        )

            res.status(201).json({
                guildName: newGuild.guildName,
                guildType: newGuild.guildType,
                guildIcon: newGuild.guildIcon,
                members: newGuild.members
            })
        }

    }

    catch(err){
        console.log("Error Creating a Guild: ", err.message);
        
        res.status(500).json({message:"Internal Server Error in guild creation"})
    }
}

export const addMembers = async(req,res) => {
    try{
            const {guildId} = req.params
            const {userIds} = req.body

            //Check if userIds given to us is an array
            if(Array.isArray(userIds) || userIds.length === 0 )
                return res.status(400).json({message: "UserId input must be a non-empty array"})
            
            //Check if there are only 10 members or not
            if(userIds.length>10)
                return res.status(400).json({message:"At most 10 members can be added at once"})

            //Fetch the guild
            const guild = await Guild.findById(guildId)

            //Prevent Duplicates
            const existingUserIds = guild.members.map(m=> m.member.toString())
            const newMembers = userIds.filter(id => !existingUserIds.includes(id))

             if (existingUserIds !== newMembers)
            res.status(400).json({message:"Some users are already memebers of this guild"})

            if(newMembers.length === 0)
                return res.status(400).json({message:"EveryBody is already a member of this guild"})
            
            //Add  new members with default role "guildMember"
            membersToBeAdded.forEach(member => {
                guild.members.push({member, role:"GuildMember"})
            });
            

            await guild.save()

            res.status(200).json({
                Message: "Members updated",
                newMembers
            })
    }
    catch(err){
        console.log("Error adding members: ", err.message);
        res.status(500).json({message: "Internal Server Error in adding members"})
        
    }
}

export const assignRole = async(req,res) => {
    try {
        const {role, guildId} = req.body
        const {targetId} = req.params


        const guild = await Guild.findById(guildId)
        if(!guild) return res.status(500).json({message:"Guild Not Found"})

        const member = guild.members.find(m=> m.member.toString()=== targetId)
        if(!member) return res.status(500).json({message: "Selected User is not the member of this guild"})

        member.role = role
        await guild.save()

        res.status(200).json({
            message:"Role updated",
            guild
        })
    }
     catch (error) {
        console.log("Error Assigining roles: ", error.message);
        res.status(500).json({message:"Internal Server Error"})
        
    }
}

export const deleteGuild = async(req,res) => {
    try{
        const {guildId} = req.body
        const user = req.user
        const guild = await Guild.findOne(
            {_id:guildId},
            {members: {$elemMatch: {role:"GuildMaster"}}}
        ).populate("members.member")

        const guildMaster = guild.members[0].member

        if(!((guildMaster._id).equals(user._id))) return res.status(400).json("Only the guild master can Delete the guild!")

        await Guild.deleteOne({_id:guildId})

        await User.updateMany(
            {affiliatedGuilds: guildId},
            {$pull:{affiliatedGuilds:guildId}}
        )


        res.status(200).json({message:"Guild Deleted Succesfully"})
    }
    catch(err){
        console.log("Error deleting the guild: ", err.message)
        res.status(500).json({message:"Internal Server Error"})
        
    }
}
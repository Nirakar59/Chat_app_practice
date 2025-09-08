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

            await User.findByIdAndUpdate(user._id, {
                $addToSet: { affiliatedGuilds: newGuild._id }
            })

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
            const userId = req.user._id

            
            //Check if userIds given to us is an array
            if(Array.isArray(userIds) || userIds.length === 0 )
                return res.status(400).json({message: "UserId input must be a non-empty array"})
            
            //Check if there are only 10 members or not
            if(userIds.length>10)
                return res.status(400).json({message:"At most 10 members can be added at once"})

            //Fetch the guild
            const guild = await Guild.findById(guildId)

            //Check if the user is allowed to add members 
            const allowedMembers = guild.members.filter((member)=> member.role==="GuildMaster"||"Vice-GuildMaster")
            let ind = 0
            allowedMembers.forEach(member => {
                if(member._id === userId) {
                    ind++
                }    
            });

            if(ind !== 1) return res.status(400).json({message: "Only GM or VGM can add members"})

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

export const getAllPublicGuilds = async(req, res) => {
    try {

        const guildss = await Guild.find({})

        if(!guildss) return res.status(400).json({message: "No guilds are created yet"})

        const publicGuilds = await Guild.find({guildType:"public"})

        res.status(200).json({publicGuilds})


    } catch (error) {
        console.log("Error getting the guilds: ", error.message);
        res.status(500).json({message: "Internal Server Error!!"})
    }

}

export const getUsersGuilds = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate("affiliatedGuilds");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.affiliatedGuilds);
    } catch (error) {
        console.log("Error getting the guilds: ", error.message);
        res.status(500).json({ message: "Internal Server Error!!" });
    }
};


export const getGuildByName = async(req,res) =>{
    try {
        const{guildName} = req.params

        const guildExists = await Guild.find({guildName})
        if(guildExists.length===0) return res.status(400).json({message: "The desired Guild doesn't exist"})   
            
        const guild = guildExists[0]

        res.status(200).json({
            guild
        })
    } catch (error) {
        console.log("Error getting the guild: ", error.message);
        res.status(500).json({message: "Internal Server Error in getting the desired Guild"})
    }
}

export const joinGuild = async(req,res) => {
    try {
        const {guildId} = req.params
        const user = req.user

        const guild = await Guild.findById(guildId)

        if (!guild) return res.status(404).json({ message: "Guild doesn't exist or already deleted" })

        if(guild.guildType === "private") return res.status(400).json({message: "Can only join a public guild"})

        const alreadyMember = guild.members.some(
            (m) => m.member.toString() === user._id.toString()
        )

        if (alreadyMember) return res.status(400).json({ message: "You are already a member" })

        guild.members.push({
            member: user._id,
            role: "GuildMember"
        })

        await guild.save()

        res.status(200).json({
            message: "Joined guild successfully",
            guild,
        })

    } catch (error) {
        console.log("Error joining Guild: ", error.message);
        res.status(500).json({message: "Internal Server Error in joining the guild"})
    }
}
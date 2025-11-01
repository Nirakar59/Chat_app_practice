import Guild from "../models/guild.model.js"
import User from "../models/user.model.js"
import cloudinary from "../lib/cloudinary.js"

export const createGuild = async (req, res) => {
    try {
        const user = req.user
        const { guildName, guildIcon, guildType } = req.body

        if (!guildName || !guildType) return res.status(400).json({ message: "Missing guild credentials !" })

        const exists = await Guild.findOne({ guildName })
        if (exists) return res.status(400).json({ message: "Name already exists" });

        const newGuild = new Guild({
            guildName,
            guildType,
            guildIcon,
            members: [{ member: user._id, role: "GuildMaster" }]
        })

        if (newGuild) {
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
    catch (err) {
        console.log("Error Creating a Guild: ", err.message);
        res.status(500).json({ message: "Internal Server Error in guild creation" })
    }
}

export const updateGuild = async (req, res) => {
    try {
        const { guildId } = req.params
        const userId = req.user._id
        const { guildName, guildIcon, guildType } = req.body

        const guild = await Guild.findById(guildId)
        if (!guild) return res.status(404).json({ message: "Guild not found" })

        // Check if user is GuildMaster
        const member = guild.members.find(m => m.member.toString() === userId.toString())
        if (!member || member.role !== "GuildMaster") {
            return res.status(403).json({ message: "Only GuildMaster can update guild" })
        }

        // Update fields
        if (guildName && guildName !== guild.guildName) {
            const nameExists = await Guild.findOne({ guildName, _id: { $ne: guildId } })
            if (nameExists) return res.status(400).json({ message: "Guild name already taken" })
            guild.guildName = guildName
        }

        if (guildIcon) {
            // Upload to cloudinary if it's a base64 string
            if (guildIcon.startsWith('data:image')) {
                const uploadResponse = await cloudinary.uploader.upload(guildIcon)
                guild.guildIcon = uploadResponse.secure_url
            } else {
                guild.guildIcon = guildIcon
            }
        }

        if (guildType) {
            guild.guildType = guildType
        }

        await guild.save()

        res.status(200).json({
            message: "Guild updated successfully",
            guild
        })
    } catch (error) {
        console.log("Error updating guild: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const addMembers = async (req, res) => {
    try {
        const { guildId } = req.params
        const { userIds } = req.body
        const userId = req.user._id

        // Check if userIds is an array
        if (!Array.isArray(userIds) || userIds.length === 0)
            return res.status(400).json({ message: "UserId input must be a non-empty array" })

        // Check max 10 members
        if (userIds.length > 10)
            return res.status(400).json({ message: "At most 10 members can be added at once" })

        // Fetch the guild
        const guild = await Guild.findById(guildId)
        if (!guild) return res.status(404).json({ message: "Guild not found" })

        // Check if user is allowed to add members (GuildMaster or Vice-GuildMaster)
        const member = guild.members.find(m => m.member.toString() === userId.toString())
        if (!member || (member.role !== "GuildMaster" && member.role !== "Vice-GuildMaster")) {
            return res.status(403).json({ message: "Only GM or VGM can add members" })
        }

        // Prevent Duplicates
        const existingUserIds = guild.members.map(m => m.member.toString())
        const newMembers = userIds.filter(id => !existingUserIds.includes(id))

        if (newMembers.length === 0)
            return res.status(400).json({ message: "All users are already members of this guild" })

        // Add new members with default role "GuildMember"
        newMembers.forEach(memberId => {
            guild.members.push({ member: memberId, role: "GuildMember" })
        });

        await guild.save()

        // Update users' affiliatedGuilds
        await User.updateMany(
            { _id: { $in: newMembers } },
            { $addToSet: { affiliatedGuilds: guildId } }
        )

        res.status(200).json({
            message: "Members added successfully",
            newMembers
        })
    }
    catch (err) {
        console.log("Error adding members: ", err.message);
        res.status(500).json({ message: "Internal Server Error in adding members" })
    }
}

export const kickMember = async (req, res) => {
    try {
        const { guildId, memberId } = req.params
        const userId = req.user._id

        const guild = await Guild.findById(guildId)
        if (!guild) return res.status(404).json({ message: "Guild not found" })

        // Check if user is GuildMaster
        const requester = guild.members.find(m => m.member.toString() === userId.toString())
        if (!requester || requester.role !== "GuildMaster") {
            return res.status(403).json({ message: "Only GuildMaster can kick members" })
        }

        // Can't kick yourself
        if (memberId === userId.toString()) {
            return res.status(400).json({ message: "Cannot kick yourself" })
        }

        // Can't kick another GuildMaster (shouldn't happen, but just in case)
        const targetMember = guild.members.find(m => m.member.toString() === memberId)
        if (targetMember && targetMember.role === "GuildMaster") {
            return res.status(400).json({ message: "Cannot kick GuildMaster" })
        }

        // Remove member
        guild.members = guild.members.filter(m => m.member.toString() !== memberId)
        await guild.save()

        // Remove guild from user's affiliatedGuilds
        await User.findByIdAndUpdate(memberId, {
            $pull: { affiliatedGuilds: guildId }
        })

        res.status(200).json({
            message: "Member kicked successfully"
        })
    } catch (error) {
        console.log("Error kicking member: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const assignRole = async (req, res) => {
    try {
        const { guildId, targetId } = req.params
        const { role } = req.body
        const userId = req.user._id

        const guild = await Guild.findById(guildId)
        if (!guild) return res.status(404).json({ message: "Guild Not Found" })

        // Check if requester is GuildMaster
        const requester = guild.members.find(m => m.member.toString() === userId.toString())
        if (!requester || requester.role !== "GuildMaster") {
            return res.status(403).json({ message: "Only GuildMaster can assign roles" })
        }

        // Can't change your own role
        if (targetId === userId.toString()) {
            return res.status(400).json({ message: "Cannot change your own role" })
        }

        // Validate role
        const validRoles = ['GuildMaster', 'Vice-GuildMaster', 'Streamer', 'GuildMember']
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role" })
        }

        const member = guild.members.find(m => m.member.toString() === targetId)
        if (!member) return res.status(404).json({ message: "Selected User is not a member of this guild" })

        member.role = role
        await guild.save()

        res.status(200).json({
            message: "Role updated successfully",
            guild
        })
    }
    catch (error) {
        console.log("Error Assigning roles: ", error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const deleteGuild = async (req, res) => {
    try {
        const { guildId } = req.body
        const user = req.user
        const guild = await Guild.findOne(
            { _id: guildId },
            { members: { $elemMatch: { role: "GuildMaster" } } }
        ).populate("members.member")

        if (!guild) return res.status(404).json({ message: "Guild not found" })

        const guildMaster = guild.members[0].member

        if (!((guildMaster._id).equals(user._id))) return res.status(403).json({ message: "Only the guild master can Delete the guild!" })

        await Guild.deleteOne({ _id: guildId })

        await User.updateMany(
            { affiliatedGuilds: guildId },
            { $pull: { affiliatedGuilds: guildId } }
        )

        res.status(200).json({ message: "Guild Deleted Successfully" })
    }
    catch (err) {
        console.log("Error deleting the guild: ", err.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const getAllPublicGuilds = async (req, res) => {
    try {
        const publicGuilds = await Guild.find({ guildType: "public" })
        res.status(200).json({ publicGuilds })
    } catch (error) {
        console.log("Error getting the guilds: ", error.message);
        res.status(500).json({ message: "Internal Server Error!!" })
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

export const getGuildByName = async (req, res) => {
    try {
        const { guildName } = req.params

        const guild = await Guild.findOne({ guildName })
            .populate('members.member', 'fullName email profilePic')
            .populate({
                path: 'streams',
                populate: { path: 'hostId', select: 'fullName profilePic' }
            })

        if (!guild) return res.status(404).json({ message: "The desired Guild doesn't exist" })

        res.status(200).json({ guild })
    } catch (error) {
        console.log("Error getting the guild: ", error.message);
        res.status(500).json({ message: "Internal Server Error in getting the desired Guild" })
    }
}

export const joinGuild = async (req, res) => {
    try {
        const { guildId } = req.params
        const user = req.user

        const guild = await Guild.findById(guildId)

        if (!guild) return res.status(404).json({ message: "Guild doesn't exist or already deleted" })

        if (guild.guildType === "private") return res.status(400).json({ message: "Can only join a public guild" })

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
        res.status(500).json({ message: "Internal Server Error in joining the guild" })
    }
}

export const getGuildMembers = async (req, res) => {
    try {
        const { guildId } = req.params

        const guild = await Guild.findById(guildId)
            .populate('members.member', 'fullName email profilePic')

        if (!guild) return res.status(404).json({ message: "Guild not found" })

        res.status(200).json({ members: guild.members })
    } catch (error) {
        console.log("Error getting guild members: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}
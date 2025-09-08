import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useGuildStore = create((set, get) => ({
    publicGuilds:[],
    guilds: [], // All guilds user is part of
    selectedGuild: null,
    isLoadingGuilds: false,
    isCreatingGuild: false,
    isAddingMembers: false,
    isAssigningRole: false,
    isDeletingGuild: false, 


    getAllGuilds: async () => {
        set({isLoadingGuilds:true})
        try{
            const res = await axiosInstance.get("/guild/getpublicguilds")
            set({ publicGuilds: res.data.publicGuilds })
        } catch(error) {
            toast.error(error.response?.data?.message || "Failed to fetch guilds");
        } finally {
            set({ isLoadingGuilds: false });
        }
    },

    getGuildByName : async(guildName) => {
        try {
            const res = await axiosInstance.get(`guild/getbyid/${guildName}`)
            set({selectedGuild: res.data.guild})
            console.log(get().selectedGuild)
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch the desired guild");
        }
    },
    // Fetch guilds for logged-in user
    getGuilds: async () => {
        set({ isLoadingGuilds: true });
        try {
            const res = await axiosInstance.get("/guild/getmyguilds");
            set({ guilds: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch guilds");
        } finally {
            set({ isLoadingGuilds: false });
        }
    },

    // Create guild
    createGuild: async (data) => {
        set({ isCreatingGuild: true });
        try {
            const res = await axiosInstance.post("/guild/create", data);
            set({ guilds: [...get().guilds, res.data], selectedGuild: res.data });
            toast.success("Guild created successfully 🎉");
        } catch (error) {
            toast.error(error.response?.data?.message || "Guild creation failed");
        } finally {
            set({ isCreatingGuild: false });
        }
    },

    // Add members
    addMembers: async (guildId, userIds) => {
        set({ isAddingMembers: true });
        try {
            const res = await axiosInstance.put(`/guild/addmembers/${guildId}`, { userIds });
            const updatedGuilds = get().guilds.map((g) =>
                g._id === guildId ? { ...g, members: [...g.members, ...res.data.newMembers] } : g
            );
            set({ guilds: updatedGuilds });
            toast.success("Members added successfully ✅");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add members");
        } finally {
            set({ isAddingMembers: false });
        }
    },

    // Join guild
    joinGuild : async(guildId) => {
        set({isAddingMembers: true})
        try {
            const res = await axiosInstance.put(`/guild/joinguild/${guildId}`)
            set({selectedGuild: res.data})
            toast.success("Guild Joined ✅")
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to join the guild");
        }
        finally{
            set({isAddingMembers: false})
        }
    },

    // Assign role
    assignRole: async (guildId, targetId, role) => {
        set({ isAssigningRole: true });
        try {
            const res = await axiosInstance.put(`/guild/assignrole/${targetId}`, { guildId, role });
            const updatedGuilds = get().guilds.map((g) =>
                g._id === guildId ? res.data.guild : g
            );
            set({ guilds: updatedGuilds });
            toast.success("Role updated successfully 👑");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to assign role");
        } finally {
            set({ isAssigningRole: false });
        }
    },

    // Delete guild
    deleteGuild: async (guildId) => {
        set({ isDeletingGuild: true });
        try {
            const res = await axiosInstance.delete("/guild/delete", { data: { guildId } });
            set({
                guilds: get().guilds.filter((g) => g._id !== guildId),
                selectedGuild: null,
            });
            toast.success(res.data.message || "Guild deleted successfully 🗑️");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete guild");
        } finally {
            set({ isDeletingGuild: false });
        }
    },


    // Select a guild
    setSelectedGuild: (guild) => set({ selectedGuild: guild }),
}));
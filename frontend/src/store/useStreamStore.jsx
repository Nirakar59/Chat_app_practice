import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { socket } from "../lib/socket";
import { useAuthStore } from "./useAuthStore";

export const useStreamStore = create((set, get) => ({
    streams: [],
    currentStream: null,
    localStream: null,
    isStreaming: false,
    isViewing: false,
    viewers: [],
    viewerCount: 0,
    chat: [],
    peerConnections: {},

    // --- API Calls ---
    fetchPublicStreams: async () => {
        try {
            const res = await axiosInstance.get("/streams/get-public-stream");
            set({ streams: res.data.publicStreams });
        } catch (err) {
            console.error("Error fetching public streams:", err.message);
        }
    },

    startStream: async (data) => {
        try {
            const res = await axiosInstance.post("/streams/start-stream", data);
            set({
                currentStream: res.data.stream,
                isStreaming: true,
            });
            const socket = useAuthStore.getState().socket
            socket.emit()
        } catch (err) {
            console.error("Error starting stream:", err.message);
        }
    },

    stopStream: async (streamId) => {
        try {
            await axiosInstance.post(`/streams/stop-stream/${streamId}`);
            set({
                currentStream: null,
                isStreaming: false,
                viewers: [],
                viewerCount: 0,
                chat: [],
            });
        } catch (err) {
            console.error("Error stopping stream:", err.message);
        }
    },

    joinStream: async (streamId) => {
        try {
            const res = await axiosInstance.post(`/streams/join-stream/${streamId}`);
            set({
                currentStream: res.data.stream,
                isViewing: true,
                viewers: res.data.stream.viewers,
                viewerCount: res.data.stream.viewerCount,
            });
        } catch (err) {
            console.error("Error joining stream:", err.message);
        }
    },

    leaveStream: async (streamId) => {
        try {
            const res = await axiosInstance.post(`/streams/leave-stream/${streamId}`);
            set({
                currentStream: res.data.stream,
                viewers: res.data.stream.viewers,
                viewerCount: res.data.stream.viewerCount,
                isViewing: false,
            });
        } catch (err) {
            console.error("Error leaving stream:", err.message);
        }
    },

    sendMessage: async (streamId, message) => {
        try {
            const res = await axiosInstance.post(`/streams/send-message/${streamId}`, { message });
            // Optimistically add message
            set((state) => ({ chat: [...state.chat, res.data.chatMsg] }));
        } catch (err) {
            console.error("Error sending message:", err.message);
        }
    },

    fetchChat: async (streamId) => {
        try {
            const res = await axiosInstance.get(`/streams/get-chat/${streamId}`);
            set({ chat: res.data.chat });
        } catch (err) {
            console.error("Error fetching chat:", err.message);
        }
    },

    // --- Socket Listeners ---
    initSocketListeners: () => {
        const { addStream, removeStream, addChatMessage, addViewer, removeViewer } = get();

        socket.on("start-stream", (streamData) => {
            addStream(streamData);
        });

        socket.on("stop-stream", (streamId) => {
            removeStream(streamId);
        });

        socket.on("new-chat-message", (msg) => {
            addChatMessage(msg);
        });

        socket.on("viewer-joined", ({ userId }) => {
            addViewer({ userId, joinedAt: new Date() });
        });

        socket.on("viewer-left", ({ userId }) => {
            removeViewer(userId);
        });
    },

    // --- Local State Actions ---
    addStream: (stream) =>
        set((state) => ({ streams: [...state.streams, stream] })),

    removeStream: (streamId) =>
        set((state) => ({
            streams: state.streams.filter((s) => s._id !== streamId),
        })),

    addChatMessage: (msg) =>
        set((state) => ({ chat: [...state.chat, msg] })),

    addViewer: (viewer) =>
        set((state) => ({
            viewers: [...state.viewers, viewer],
            viewerCount: state.viewerCount + 1,
        })),

    removeViewer: (userId) =>
        set((state) => {
            const newViewers = state.viewers.filter((v) => v.userId !== userId);
            return { viewers: newViewers, viewerCount: newViewers.length };
        }),
}));

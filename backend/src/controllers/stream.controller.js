import { io } from "../lib/socket.js"
import Stream from "../models/stream.model.js"

export const startStream = async (req, res) => {
  try {
    const { hostId, title, description, streamType, category, roomId, thumbnailUrl } = req.body;

    if (!hostId) return res.status(400).json({ message: "Host Id is missing" });
    if (!roomId) return res.status(400).json({ message: "Room Id is missing" });

    const newStream = new Stream({
      hostId,
      title: title || "Untitled Stream",
      description: description || "",
      streamType: streamType || "Public",
      category,
      roomId,
      viewerCount: 0,
      viewers: [],
      chat: [],
      thumbnailUrl: thumbnailUrl || ""
    });

    await newStream.save();

    res.status(201).json({ message: "Stream started successfully", stream: newStream });

  } catch (error) {
    console.log("Error Starting Stream: ", error.message);
    res.status(500).json({ message: "Internal Server Error in Starting Stream" });
  }
};


export const getPublicStream = async (req,res) => {
       try {
        const userId = req.user._id
        const publicStreams = await Stream.find({
            streamType: "public",
            hostId: { $ne: userId }
        })
        .sort({ createdAt: -1 })

        res.status(200).json({publicStreams})

       } catch (error) {
        console.log("Error getting the public streams: ", error.message);
        res.status(500).json({message: "Internal Server Error in getting the public streams"})
       }
}

// Stop a stream
export const stopStream = async (req, res) => {
    try {
        const { streamId } = req.params;
        const stream = await Stream.findById(streamId);

        if (!stream) return res.status(404).json({ message: "Stream not found" });

        await stream.deleteOne();

        io.emit("stop-stream", streamId); // notify clients

        res.status(200).json({ message: "Stream stopped" });
    } catch (err) {
        res.status(500).json({ message: "Error stopping stream" });
    }
};

// Join a stream
export const joinStream = async (req, res) => {
    try {
        const { streamId } = req.params;
        const userId = req.user._id;

        const stream = await Stream.findById(streamId);
        if (!stream) return res.status(404).json({ message: "Stream not found" });

        if (!stream.viewers.some(v => v.userId.toString() === userId.toString())) {
            stream.viewers.push({ userId });
            stream.viewerCount = stream.viewers.length;
            await stream.save();
        }

        io.to(stream.roomId).emit("viewer-joined", { userId, streamId });

        res.status(200).json({ message: "Joined stream", stream });
    } catch (err) {
        res.status(500).json({ message: "Error joining stream" });
    }
};

// Leave a stream
export const leaveStream = async (req, res) => {
    try {
        const { streamId } = req.params;
        const userId = req.user._id;

        const stream = await Stream.findById(streamId);
        if (!stream) return res.status(404).json({ message: "Stream not found" });

        stream.viewers = stream.viewers.filter(
            v => v.userId.toString() !== userId.toString()
        );
        stream.viewerCount = stream.viewers.length;
        await stream.save();

        io.to(stream.roomId).emit("viewer-left", { userId, streamId });

        res.status(200).json({ message: "Left stream", stream });
    } catch (err) {
        res.status(500).json({ message: "Error leaving stream" });
    }
};

// Send chat message
export const sendMessage = async (req, res) => {
    try {
        const { streamId } = req.params;
        const { message } = req.body;
        const userId = req.user._id;

        const stream = await Stream.findById(streamId);
        if (!stream) return res.status(404).json({ message: "Stream not found" });

        const chatMsg = { senderId: userId, message };
        stream.chat.push(chatMsg);
        await stream.save();

        io.to(stream.roomId).emit("new-chat-message", chatMsg);

        res.status(201).json({ message: "Message sent", chatMsg });
    } catch (err) {
        res.status(500).json({ message: "Error sending message" });
    }
};

// Get all chat messages for a stream
export const getStreamChat = async (req, res) => {
    try {
        const { streamId } = req.params;
        const stream = await Stream.findById(streamId).populate("chat.senderId", "username");

        if (!stream) return res.status(404).json({ message: "Stream not found" });

        res.status(200).json({ chat: stream.chat });
    } catch (err) {
        res.status(500).json({ message: "Error fetching chat" });
    }
};



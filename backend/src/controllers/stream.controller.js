import { io } from "../lib/socket.js"
import Stream from "../models/stream.model.js"
import Guild from "../models/guild.model.js"

export const startStream = async (req, res) => {
  try {
    const { title, description, streamType, category, guildId, thumbnailUrl } = req.body;
    const hostId = req.user._id;

    // Generate unique room ID
    const roomId = `stream_${hostId}_${Date.now()}`;

    // Validate guild if guild-based stream
    if (streamType === "Guild-Based") {
      if (!guildId) return res.status(400).json({ message: "Guild ID required for guild-based streams" });

      const guild = await Guild.findById(guildId);
      if (!guild) return res.status(404).json({ message: "Guild not found" });

      // Check if user is member of guild
      const isMember = guild.members.some(m => m.member.toString() === hostId.toString());
      if (!isMember) return res.status(403).json({ message: "You must be a guild member to stream" });
    }

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

    // Add stream to guild if guild-based
    if (streamType === "Guild-Based" && guildId) {
      await Guild.findByIdAndUpdate(guildId, {
        $push: { streams: newStream._id }
      });
    }

    // Emit to all users about new stream
    io.emit("new-stream", {
      streamId: newStream._id,
      hostId,
      title: newStream.title,
      streamType: newStream.streamType,
      roomId: newStream.roomId
    });

    res.status(201).json({
      message: "Stream started successfully",
      stream: newStream
    });

  } catch (error) {
    console.log("Error Starting Stream: ", error.message);
    res.status(500).json({ message: "Internal Server Error in Starting Stream" });
  }
};

export const getPublicStreams = async (req, res) => {
  try {
    const userId = req.user._id;
    const publicStreams = await Stream.find({
      streamType: "Public",
      hostId: { $ne: userId } // Exclude own streams
    })
      .populate("hostId", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({ publicStreams });
  } catch (error) {
    console.log("Error getting public streams: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getGuildStreams = async (req, res) => {
  try {
    const { guildId } = req.params;
    const userId = req.user._id;

    const guild = await Guild.findById(guildId)
      .populate({
        path: "streams",
        populate: { path: "hostId", select: "fullName profilePic" }
      });

    if (!guild) return res.status(404).json({ message: "Guild not found" });

    // Filter out own streams
    const guildStreams = guild.streams.filter(
      stream => stream.hostId._id.toString() !== userId.toString()
    );

    res.status(200).json({ guildStreams });
  } catch (error) {
    console.log("Error getting guild streams: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const stopStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = req.user._id;

    const stream = await Stream.findById(streamId);
    if (!stream) return res.status(404).json({ message: "Stream not found" });

    // Verify the user is the host
    if (stream.hostId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can stop the stream" });
    }

    // Remove from guild if guild-based
    if (stream.streamType === "Guild-Based") {
      await Guild.updateMany(
        { streams: streamId },
        { $pull: { streams: streamId } }
      );
    }

    await stream.deleteOne();

    // Notify all viewers
    io.to(stream.roomId).emit("stream-ended", { streamId });
    io.emit("stream-stopped", { streamId });

    res.status(200).json({ message: "Stream stopped successfully" });
  } catch (error) {
    console.log("Error stopping stream: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const joinStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = req.user._id;

    const stream = await Stream.findById(streamId).populate("hostId", "fullName profilePic");
    if (!stream) return res.status(404).json({ message: "Stream not found" });

    // Prevent host from joining their own stream as a viewer
    if (stream.hostId._id.toString() === userId.toString()) {
      return res.status(403).json({ message: "You cannot watch your own stream" });
    }

    // Add viewer if not already present
    if (!stream.viewers.some(v => v.userId.toString() === userId.toString())) {
      stream.viewers.push({ userId });
      stream.viewerCount = stream.viewers.length;
      await stream.save();
    }

    io.to(stream.roomId).emit("viewer-joined", {
      userId,
      streamId,
      viewerCount: stream.viewerCount
    });

    res.status(200).json({
      message: "Joined stream",
      stream,
      hlsUrl: `/live/${stream.roomId}/index.m3u8`
    });
  } catch (error) {
    console.log("Error joining stream: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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

    io.to(stream.roomId).emit("viewer-left", {
      userId,
      streamId,
      viewerCount: stream.viewerCount
    });

    res.status(200).json({ message: "Left stream" });
  } catch (error) {
    console.log("Error leaving stream: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendChatMessage = async (req, res) => {
  try {
    const { streamId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    const stream = await Stream.findById(streamId);
    if (!stream) return res.status(404).json({ message: "Stream not found" });

    const chatMsg = {
      senderId: userId,
      message,
      timestamp: new Date()
    };

    stream.chat.push(chatMsg);
    await stream.save();

    // Populate sender info for real-time emit
    const populatedMsg = await Stream.findById(streamId)
      .populate("chat.senderId", "fullName profilePic")
      .then(s => s.chat[s.chat.length - 1]);

    io.to(stream.roomId).emit("new-stream-chat", populatedMsg);

    res.status(201).json({ message: "Message sent", chatMsg: populatedMsg });
  } catch (error) {
    console.log("Error sending message: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStreamChat = async (req, res) => {
  try {
    const { streamId } = req.params;
    const stream = await Stream.findById(streamId)
      .populate("chat.senderId", "fullName profilePic");

    if (!stream) return res.status(404).json({ message: "Stream not found" });

    res.status(200).json({ chat: stream.chat });
  } catch (error) {
    console.log("Error fetching chat: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStreamById = async (req, res) => {
  try {
    const { streamId } = req.params;
    const stream = await Stream.findById(streamId)
      .populate("hostId", "fullName profilePic");

    if (!stream) return res.status(404).json({ message: "Stream not found" });

    res.status(200).json({ stream });
  } catch (error) {
    console.log("Error fetching stream: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
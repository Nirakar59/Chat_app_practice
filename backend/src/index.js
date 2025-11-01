import express from "express";
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import guildRoutes from "./routes/guild.routes.js"
import friendRequestRoutes from "./routes/friendRequest.route.js"
import streamRoutes from "./routes/stream.route.js"
import guildChatRoutes from "./routes/guildMessage.routes.js"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import { connectDB } from "./db/db.js";
import cors from "cors"
import { app, server } from "./lib/socket.js";
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config()

const PORT = process.env.PORT;
const activeFFmpegProcesses = new Map();
const activeStreams = new Map();

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

// Serve HLS files
app.use('/live', express.static(path.join(__dirname, '../media/live')));

app.use("/api/message", messageRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/guild", guildRoutes)
app.use("/api/friend-request", friendRequestRoutes)
app.use("/api/stream", streamRoutes)
app.use("/api/guildchat", guildChatRoutes)

// WebSocket handling for browser streams
import { io } from "./lib/socket.js";

io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id)

    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId
    if (userId) {
        console.log(`User ${userId} connected with socket ${socket.id}`);
    }

    // Handle stream start from browser
    socket.on("start-browser-stream", async ({ streamId, roomId }) => {
        try {
            console.log(`[WebSocket] Starting browser stream for room: ${roomId}`);

            socket.join(roomId);

            const outputDir = path.join(__dirname, '../media/live', roomId);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Start FFmpeg process with low latency settings
            const ffmpegProcess = spawn('ffmpeg', [
                // Input (from browser WebRTC or MediaRecorder)
                '-i', 'pipe:0',

                // Allow normal internal buffering for stability
                // (remove: '-fflags', 'nobuffer', '-flags', 'low_delay')

                // Video encoding
                '-c:v', 'libx264',
                '-preset', 'veryfast',              // balance between speed and quality
                '-profile:v', 'main',               // better compression than 'baseline'
                '-level', '4.0',                    // supports up to 1080p30
                '-g', '90',                         // keyframe interval = 3 seconds @30fps
                '-keyint_min', '90',
                '-sc_threshold', '40',              // enable scene-based keyframes
                '-pix_fmt', 'yuv420p',              // ensures compatibility
                '-b:v', '2500k',                    // target video bitrate (adjust as needed)
                '-maxrate', '3000k',
                '-bufsize', '6000k',

                // Audio encoding
                '-c:a', 'aac',
                '-b:a', '128k',
                '-ac', '2',

                // HLS output (target ~15–18s latency)
                '-f', 'hls',
                '-hls_time', '4',                   // each segment = 4 seconds
                '-hls_list_size', '5',              // playlist will hold 5 segments
                '-hls_flags', 'delete_segments+append_list+omit_endlist',
                '-hls_segment_type', 'mpegts',
                '-hls_segment_filename', path.join(outputDir, 'segment%d.ts'),
                '-start_number', '0',
                path.join(outputDir, 'index.m3u8')
            ]);


            ffmpegProcess.stderr.on('data', (data) => {
                const message = data.toString();
                if (!message.includes('frame=')) {
                    console.log(`[FFmpeg ${roomId}]:`, message);
                }
            });

            ffmpegProcess.on('error', (err) => {
                console.error(`[FFmpeg ${roomId}] Error:`, err);
                socket.emit('stream-error', { error: err.message });
            });

            ffmpegProcess.on('close', (code) => {
                console.log(`[FFmpeg ${roomId}] Process exited with code ${code}`);
                activeFFmpegProcesses.delete(roomId);
                io.to(roomId).emit('stream-ended', { streamId });
            });

            activeFFmpegProcesses.set(roomId, ffmpegProcess);
            activeStreams.set(roomId, { streamId, socketId: socket.id });

            socket.emit('stream-ready', {
                message: 'Stream started successfully',
                hlsUrl: `/live/${roomId}/index.m3u8`
            });

        } catch (error) {
            console.error('[WebSocket] Error starting stream:', error);
            socket.emit('stream-error', { error: error.message });
        }
    });

    // Handle stream data
    socket.on("stream-data", ({ roomId, data }) => {
        const ffmpegProcess = activeFFmpegProcesses.get(roomId);
        if (ffmpegProcess && !ffmpegProcess.killed && ffmpegProcess.stdin.writable) {
            try {
                const buffer = Buffer.from(data);
                ffmpegProcess.stdin.write(buffer);
            } catch (err) {
                console.error('[WebSocket] Error writing to FFmpeg:', err);
            }
        }
    });

    // Handle stop stream
    socket.on("stop-browser-stream", ({ roomId }) => {
        const ffmpegProcess = activeFFmpegProcesses.get(roomId);
        if (ffmpegProcess && !ffmpegProcess.killed) {
            try {
                ffmpegProcess.stdin.end();
                setTimeout(() => {
                    if (!ffmpegProcess.killed) {
                        ffmpegProcess.kill('SIGTERM');
                    }
                }, 1000);
                activeFFmpegProcesses.delete(roomId);
                activeStreams.delete(roomId);
            } catch (err) {
                console.error('[WebSocket] Error closing FFmpeg:', err);
            }
        }
        socket.leave(roomId);
    });

    // Handle viewer joining stream room
    socket.on("join-stream-room", ({ roomId }) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined stream room: ${roomId}`);
    });

    // Handle viewer leaving stream room
    socket.on("leave-stream-room", ({ roomId }) => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left stream room: ${roomId}`);
    });

    socket.on("disconnect", (reason) => {
        console.log("❌ User disconnected:", socket.id, reason);

        // Clean up any streams started by this socket
        for (const [roomId, streamInfo] of activeStreams.entries()) {
            if (streamInfo.socketId === socket.id) {
                const ffmpegProcess = activeFFmpegProcesses.get(roomId);
                if (ffmpegProcess && !ffmpegProcess.killed) {
                    try {
                        ffmpegProcess.stdin.end();
                        ffmpegProcess.kill('SIGTERM');
                        activeFFmpegProcesses.delete(roomId);
                        activeStreams.delete(roomId);
                        io.to(roomId).emit('stream-ended', { streamId: streamInfo.streamId });
                    } catch (err) {
                        console.error('Error cleaning up stream:', err);
                    }
                }
            }
        }
    });
});

// Cleanup on exit
process.on('SIGINT', () => {
    console.log('\nShutting down...');

    for (const [roomId, process] of activeFFmpegProcesses) {
        console.log(`Killing FFmpeg process for ${roomId}`);
        try {
            process.kill('SIGTERM');
        } catch (err) {
            console.error(`Error killing process for ${roomId}:`, err);
        }
    }

    process.exit();
});

server.listen(PORT, () => {
    console.log('========================================');
    console.log(`Server listening on port ${PORT}`);
    console.log('========================================');
    console.log('API Server:        http://localhost:' + PORT);
    console.log('WebSocket:         ws://localhost:' + PORT);
    console.log('HLS Streams:       http://localhost:' + PORT + '/live');
    console.log('========================================');
    connectDB()
});
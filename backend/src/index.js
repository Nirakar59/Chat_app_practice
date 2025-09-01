import express from "express";
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import guildRoutes from "./routes/guild.routes.js"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import { connectDB } from "./db/db.js";
import cors from "cors"
import { app, server } from "./lib/socket.js";

dotenv.config()

const PORT = process.env.PORT;
app.use(express.json())
app.use(cookieParser())
app.use(cors(
    {
     origin:"http://localhost:5173",
     credentials:true   
    }
))

app.use("/api/message", messageRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/guild", guildRoutes)


server.listen(PORT, (req, res) => {
    console.log(`Server listening on port ${PORT}`);
    connectDB()
});
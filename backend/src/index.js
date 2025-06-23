import express from "express";
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import { connectDB } from "./db/db.js";
import cors from "cors"

dotenv.config()

const PORT = process.env.PORT;
const app = express();
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


app.listen(PORT, (req, res) => {
    console.log(`Server listening on port ${PORT}`);
    connectDB()
});
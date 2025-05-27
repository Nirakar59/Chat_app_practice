import express from "express";
import authRoutes from "./routes/auth.route.js"
import dotenv from "dotenv"
import { connectDB } from "./db/db.js";

dotenv.config()

const PORT = process.env.PORT;
const app = express();
app.use(express.json())
app.use("/api/auth", authRoutes)

app.listen(PORT, (req, res)=>{
    console.log(`Server listening on port ${PORT}`);
    connectDB()
});
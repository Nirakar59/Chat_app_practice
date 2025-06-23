import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

export const protectRoute = async (req, res, next) => {
    const token = req.cookies.jwt
    try {
        if (!token) {
            return res.status(400).json({ message: "No token found!!" })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        if (!decoded) {
            return res.status(400).json({ message: "Unauthorized User - Invalid token" })
        }
        const user = await User.findById(decoded.userId).select("-password")

        if (!user) {
            return res.status(400).json({ message: "User not found !!" })
        }
        // when user is found 
        req.user = user;

        next()

    } catch (error) {
        console.log("Error in loginCheck: ", error.message);
        res.status(500).json({ message: "Internal Server Error!!" })

    }
}
import bcrypt from 'bcryptjs'
import User from '../models/user.model.js'
import { genToken } from '../utils/generateToken.js'
import cloudinary from '../lib/cloudinary.js'


export const signup = async (req, res) => {

    const { fullName, password, email } = req.body
    try {
        if (!fullName || !password || !email) return res.status(400).json({ message: "All fields are required!!" })
        if (password < 8) {
            return res.status(400).json({ message: "Password must be atleast 8 characters long" })
        }
        const user = await User.findOne({ email })

        if (user) {
            return res.status(400).json({ message: "User already exists from this email" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })
        if (newUser) {
            genToken(newUser._id, res)
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                password: newUser.password,
                profilePic: newUser.profilePic
            });
        }
        else {
            res.status(400).json({ message: "Invalid User Details" })
        }
    }
    catch (error) {
        console.log("Error in authentication controller: ", error.message);
        res.status(500).json("Internal Server Error!!")
    }
}

export const login = async (req, res) => {

    const { email, password } = req.body

    try {

        if (!email || !password)
            return res.status(400).json("All fields are required!!")

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }
        else {
            genToken(user._id, res)
            res.status(200).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                password: user.password,
                message: "logged in succesfully"
            })
        }

    } catch (error) {
        console.log("Error in Signing In: ", error.message);
        res.send(500).json({ message: "Internal sever error" })
    }
}

export const logout = (req, res) => {

    try {
        res.cookie("jwt", "", { maxAge: 0 })
        res.status(200).json({ message: "Log Out succesfull" })
    } catch (error) {
        console.log("LogOut Error: ", error.message);
        res.status(500).json({ message: "Internal Server Error!! " })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body
        const userId = req.user._id

        if (!profilePic) return res.status(400).json({ message: "Profile Pic required!" })

        const upload = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url }, { new: true })
        res.status(201).json({updatedUser})
    } catch (error) {
        console.log("Profile Update error: ", error.message);
        res.status(500).json({ message: "Internal Server Error!!" })
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        res.status(500).json({ message: "internal server error" })
    }
}
const userModel = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const blackListModel = require("../models/blacklist.model.js");
const redis = require("../config/chache.js");

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const isalreadyexist = await userModel.findOne({ $or: [{ username }, { email }] });
        if (isalreadyexist) {
            return res.status(400).json({ message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await userModel.create({ username, email, password: hashedPassword });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        // res.status(201).json({ message: "User created successfully", user, token }); 
        res.status(201).json({
            message: "User created successfully", user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const query = [];
        if (username) query.push({ username });
        if (email) query.push({ email });

        if (query.length === 0) {
            return res.status(400).json({ message: "Please provide email or username" });
        }

        const user = await userModel.findOne({ $or: query }).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            message: "User logged in successfully", user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

async function getMe(req, res) {
    try {
        const user = await userModel.findById(req.user.id);
        res.status(200).json({ message: "User found successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function logoutUser(req, res) {
    const token = req.cookies.token;
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    await redis.set(token, Date.now().toString());    
    await blackListModel.create({ token });
    res.status(200).json({ message: "User logged out successfully" });
}

module.exports = { registerUser, loginUser, getMe, logoutUser }; 
const userModel = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const redis = require("../config/chache.js");

async function authUser(req, res, next) {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
        try {
        const isTokenBlacklisted = await redis.get(token);
        console.log(isTokenBlacklisted);
        if (isTokenBlacklisted) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decodedToken);
        const user = await userModel.findById(decodedToken.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}
module.exports = { authUser };

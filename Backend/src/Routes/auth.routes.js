const express = require("express"); 
const router = express.Router(); 
const userModel = require("../models/user.model.js"); 
const authController = require("../controllers/auth.controller.js");  
const {authUser} = require("../middleware/auth.middleware.js"); 

router.post("/register", authController.registerUser);  
router.post("/login", authController.loginUser);
router.get("/getme",authUser,authController.getMe);
router.get("/logout",authUser,authController.logoutUser);


module.exports = router;    
const express = require('express'); 
const cookieParser = require('cookie-parser'); 
const cors = require('cors');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Routes
const authRoutes = require("./Routes/auth.routes.js"); 
const songRoutes = require("./Routes/song.routes.js");

app.use("/api/auth", authRoutes);   
app.use("/api/songs", songRoutes);
module.exports = app;
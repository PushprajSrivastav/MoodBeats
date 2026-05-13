const express = require("express");
const router = express.Router();
const upload = require('../middleware/upload.middleware')
const songController = require('../controllers/song.controller')
const { authUser } = require('../middleware/auth.middleware')

// POST /api/songs

router.post("/", authUser, upload.single("song"), songController.uploadSong)

router.get("/", authUser, songController.getSongs)

router.delete("/:id", authUser, songController.deleteSong)

router.patch("/:id/mood", authUser, songController.updateSongMood)


module.exports = router;        


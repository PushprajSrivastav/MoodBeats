const songModel = require('../models/song.model');
const id3 = require('node-id3');
const storageService = require('../services/storage.service');

async function uploadSong(req, res) {
    try {
        const songBuffer = req.file.buffer;
        const mood = req.body.mood;
        const tags = id3.read(songBuffer) || {};
        
        const title = tags.title || "Unknown_Song_" + Date.now();
        const promises = [
            storageService.uploadFile({ buffer: songBuffer, filename: title + ".mp3", folder: "moodify/songs" })
        ];

        if (tags.image && tags.image.imageBuffer) {
            promises.push(storageService.uploadFile({ buffer: tags.image.imageBuffer, filename: title + ".jpg", folder: "moodify/thumbnails" }));
        }

        const results = await Promise.all(promises);
        const songfile = results[0];
        const thumbnailFile = results.length > 1 ? results[1] : null;

        const existingSong = await songModel.findOne({ title: title, user: req.user._id });

        if (existingSong) {
            existingSong.mood = mood ? mood.toLowerCase() : existingSong.mood;
            if (!existingSong.posterUrl && thumbnailFile) {
                existingSong.posterUrl = thumbnailFile.url;
            }
            await existingSong.save();
            return res.status(200).json({ success: true, message: "Song mood updated successfully", data: existingSong });
        }

        const song = await songModel.create({
            title: title,
            posterUrl: thumbnailFile ? thumbnailFile.url : null,
            url: songfile.url,
            mood: mood ? mood.toLowerCase() : undefined,
            user: req.user._id
        });
        return res.status(201).json({ success: true, message: "Song uploaded successfully", data: song });
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ success: false, message: "Failed to upload song", error: error.message });
    }
}

async function getSongs(req, res) {
    const mood = req.query.mood;
    const userId = req.user._id;

    let query = { user: userId };
    if (mood) {
        query.mood = mood;
    }

    const songs = await songModel.find(query);
    return res.status(200).json({ success: true, message: "Songs fetched successfully", data: songs })
}

async function deleteSong(req, res) {
    const songId = req.params.id;
    const userId = req.user._id;

    try {
        const song = await songModel.findOneAndDelete({ _id: songId, user: userId });
        if (!song) {
            return res.status(404).json({ success: false, message: "Song not found or unauthorized" });
        }
        return res.status(200).json({ success: true, message: "Song deleted successfully" });
    } catch (error) {
        console.error("Delete failed", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function updateSongMood(req, res) {
    const songId = req.params.id;
    const { mood } = req.body;
    const userId = req.user._id;

    try {
        const song = await songModel.findOneAndUpdate(
            { _id: songId, user: userId },
            { mood: mood.toLowerCase() },
            { new: true }
        );
        if (!song) {
            return res.status(404).json({ success: false, message: "Song not found or unauthorized" });
        }
        return res.status(200).json({ success: true, message: "Mood updated successfully", data: song });
    } catch (error) {
        console.error("Update failed", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports = { uploadSong,getSongs,deleteSong,updateSongMood };
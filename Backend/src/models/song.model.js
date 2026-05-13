const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema({
    url: { type: String, required: true },
    posterUrl: { type: String, required: true },
    title: { type: String, required: true },
    mood: { 
        type: String,
        enum:{ values:["happy", "sad", "energetic", "calm", "romantic", "angry"],message:"please select valid mood"}
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
});

const songModel = mongoose.model('songs', SongSchema);

module.exports = songModel;


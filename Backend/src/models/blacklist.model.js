const mongoose = require("mongoose");  
const blackListTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    }
},{
    timestamps: true,   
});
const blackListModel = mongoose.model("blackListToken", blackListTokenSchema);
module.exports = blackListModel; 
require("dotenv").config();
const app = require("./src/app.js");
const connectDB = require("./src/config/database.js");

connectDB();

// making the app 
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
}); 
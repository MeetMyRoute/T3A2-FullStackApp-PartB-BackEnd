const mongoose = require("mongoose");

async function dbConnect() {
    let dbUrl = process.env.DB_URI || "mongodb://localhost:27017/MeetMyRoute";
    await mongoose.connect(dbUrl);
    console.log("Database connected")
}

module.exports = {
    dbConnect
}
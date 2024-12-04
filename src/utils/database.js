const mongoose = require("mongoose");

async function dbConnect() {
    let dbUrl = process.env.DB_URI || "mongodb://localhost:27017/MeetMyRoute";
    await mongoose.connect(dbUrl);
    console.log("Database connected");
}

async function dbDisconnect() {
    await mongoose.connection.close();
    console.log("Database disconnected");
}

async function dbDrop() {
    await mongoose.connection.db.dropDatabase();
    console.log("Database dropped");
}

module.exports = {
    dbConnect,
    dbDisconnect,
    dbDrop
}
require("dotenv").config();

const { dbConnect } = require("./utils/database.js");
const { app, server } = require("./server.js");

const PORT = process.env.PORT || 4000;

server.listen(PORT, async() => {
    await dbConnect();
    console.log(`Server is running on port ${PORT}`);
});
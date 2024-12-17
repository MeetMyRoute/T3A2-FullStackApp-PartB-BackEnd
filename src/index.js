require("dotenv").config();
const { dbConnect } = require("./utils/database.js");
const { app } = require("./server.js");

const PORT = process.env.PORT || 4000;

app.listen(PORT, async() => {
    await dbConnect();
    console.log(`Server is running on port ${PORT}`);
});
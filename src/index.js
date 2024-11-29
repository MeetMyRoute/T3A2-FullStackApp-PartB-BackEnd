require("dotenv").config();

const { dbConnect } = require("./database.js");
const {app} = require("./server.js");

const PORT = process.env.PORT || 8080

app.listen(PORT, async() => {
    await dbConnect();
    console.log(`Server is running on port ${PORT}`);
});
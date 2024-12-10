require("dotenv").config();

const { dbConnect } = require("./utils/database.js");
const {app} = require("./server.js");

dbConnect();
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
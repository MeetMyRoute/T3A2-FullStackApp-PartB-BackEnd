const express = require("express");
const { auth } = require("../middleware/auth");
const { sendMessage, getConnects } = require("../controllers/MessageController");
const router = express.Router();

// Route for sending a message and storing it in the database
router.post("/", auth, sendMessage);

// Route for getting the list of users the logged-in user has exchanged messages with
router.get("/", auth, getConnects);

module.exports = router;
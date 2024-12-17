const express = require("express");
const { auth } = require("../middleware/auth");
const { sendConnectMessage, getConnectMessages } = require("../controllers/MessageController");
const router = express.Router();

// Route for sending a message and storing it in the database
router.post("/", auth, sendConnectMessage);

// Getting all connect messages
router.get("/", auth, getConnectMessages);

module.exports = router;
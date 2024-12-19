const express = require("express");
const { auth } = require("../middleware/auth");
const { sendConnectMessage, getUserConnects } = require("../controllers/MessageController");
const router = express.Router();

// Route for sending a message and storing it in the database
router.post("/", auth, sendConnectMessage);

// Route for getting all connections
router.get("/", auth, getUserConnects);

module.exports = router;
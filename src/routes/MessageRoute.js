const express = require("express");
const { auth } = require("../middleware/auth");
const { sendMessage, getConnects } = require("../controllers/MessageController");
const router = express.Router();

// Route for sending a message and storing it in the database
router.post("/", auth, sendMessage);

// Route for getting all connections
router.get("/", auth, getConnects);

module.exports = router;
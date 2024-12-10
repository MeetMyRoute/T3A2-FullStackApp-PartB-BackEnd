const express = require("express");
const { getProfile, updateProfile } = require("../controllers/ProfileController");
const router = express.Router();
// const { auth } = require();

// Route for getting user profile of a specific user
router.get("/:id", getProfile);

// Route for updating user profile details for a specific user
router.put("/:id", updateProfile);

module.exports = router;
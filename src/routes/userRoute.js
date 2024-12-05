const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth"); 

const {
  registerUser,
  loginUser,
  recieveLoggedInUser, 
} = require("../controllers/userController");

// Route to register a new user
router.post("/", registerUser);
// Route to log in an existing user and generate a token
router.post("/login", loginUser);
// Route to log in an existing user and generate a token
router.get("/me", auth, recieveLoggedInUser); 

module.exports = router;
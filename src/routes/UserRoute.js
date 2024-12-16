const express = require("express");
const router = express.Router();
const { auth } = require('../middleware/auth');

const {
  getAllUsers, 
  registerUser,
  loginUser,
  getUserById,
  recieveLoggedInUser,  
  adminLogin, 
  forgetPassword, 
  resetPassword,
} = require("../controllers/UserController");

// Route to register a new user
router.post("/", registerUser);
// Route to log in an existing user and generate a token
router.post("/login", loginUser);
// Route to log in admin user and generate a token 
router.post("/adminLogin",adminLogin);
// Route to get all users (requires admin authentication)
router.get("/", auth, getAllUsers);
// Route to get user by ID
router.get("/:id", getUserById)
// Route to fetch the currently logged-in user's information
router.get("/me", auth, recieveLoggedInUser);
// Route to handle forgotten password requests
router.post("/forgetPassword", forgetPassword);
// Route to handle password reset using a valid token
router.patch("/reset-password", resetPassword);

module.exports = router;
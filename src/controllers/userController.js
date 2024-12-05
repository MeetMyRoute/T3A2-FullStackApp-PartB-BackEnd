const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler"); 
const jwt = require("jsonwebtoken");
const { userModel } = require('../model/userModel');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_ACCESS_TOKEN, {
        expiresIn: '1h',
    });
  };

// Get users 
// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, status, location, travelPreferencesAndGoals, socialMediaLink } = req.body;

  try {
      // check fields have been filled in
      if (!email || !password || !status || !location || !travelPreferencesAndGoals || !socialMediaLink) {
          return res.status(400).json({ message: "Please fill in all fields" });
      }

      // check if user already exists
      const userExists = await userModel.findOne({ email });
      if (userExists) {
          return res.status(400).json({ message: "User already exists" });
      }

      // create hashed password
      const salt = await bcrypt.genSalt(10); 
      const hashedPassword = await bcrypt.hash(password, salt);

      // create a new user
      const newUser = await userModel.create({
          name,
          email,
          password: hashedPassword,
          location,
          travelPreferencesAndGoals,
          status,
          socialMediaLink,
      });

      // check if user creation was successful
      if (newUser) {
          return res.status(201).json({
              _id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              status: newUser.status,
              location: newUser.location,
              travelPreferencesAndGoals: newUser.travelPreferencesAndGoals, 
              socialMediaLink: newUser.socialMediaLink,
              token: generateToken(newUser._id),
          });
      } else {
          return res.status(400).json({ message: "Invalid user details" });
      }
  } catch (error) {
      console.error("Error during user registration:", error);
      res.status(500).json({ message: "An error occurred while registering the user. Please try again later." });
  }
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if required fields are present
  if (!email || !password) {
      return res.status(400).json({ message: "Please add all fields" });
  }

  try {
      // Check for user by email
      const user = await userModel.findOne({ email });

      if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare passwords
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = generateToken(user._id);

      // Respond with success message and token
      res.json({
          message: "Logged in successfully",
          token,
      });
  } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "An error occurred. Please try again later." });
  }
});

// Get currently logged-in user data
const recieveLoggedInUser = asyncHandler(async (req, res) => {
    const { _id, name, email } = await userModel.findById(req.user.id); 
    res.status(200).json({
        id: _id, 
        name, 
        email, 
    }); 
}); 

// Admin login 
/// RESET PASSWORD!

module.exports = {
    registerUser,
    loginUser,
    recieveLoggedInUser
};
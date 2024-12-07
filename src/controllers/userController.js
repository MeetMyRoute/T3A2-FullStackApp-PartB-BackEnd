const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler"); 
const jwt = require("jsonwebtoken");
const { userModel } = require('../model/userModel');

// Generate JWT Token
const generateToken = (id, isAdmin) => {
    return jwt.sign({ id, isAdmin }, process.env.SECRET_ACCESS_TOKEN, {
        expiresIn: '1h',
    });
  };

// @desc    Register new user
// @route   POST /api/users
const registerUser = asyncHandler(async (req, res) => {
  const {name, email, password, status, location, travelPreferencesAndGoals, socialMediaLink, isAdmin} = req.body;

  try {
      // Check fields have been filled in
      if (!email || !password || !status || !location || !travelPreferencesAndGoals || !socialMediaLink) {
          return res.status(400).json({ message: "Please fill in all fields" });
      }

      // Check if user already exists
      const userExists = await userModel.findOne({ email });
      if (userExists) {
          return res.status(400).json({ message: "User already exists" });
      }

      // Create hashed password
      const salt = await bcrypt.genSalt(10); 
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create a new user
      const newUser = await userModel.create({
          name,
          email,
          password: hashedPassword,
          location,
          travelPreferencesAndGoals,
          status,
          socialMediaLink,
          isAdmin: isAdmin || false 
      });

      // Check if user creation was successful
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

// @desc    User Login
// @route   POST /api/users/login
const loginUser = asyncHandler(async (req, res) => {
  const {email, password} = req.body;

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
          return res.status(401).json({ message: "Invalid password" });
      }

      // Generate JWT token
      const token = generateToken(user._id, user.isAdmin);

      // Respond with success message and token
      res.json({
          message: "Logged in successfully",
          user: {id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin},
          token,
      });
  } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "An error occurred. Please try again later." });
  }
});

// @desc    Get currently logged-in user data 
// @route   GET /api/users/me
// @access  Admin
const recieveLoggedInUser = asyncHandler(async (req, res) => {
    if (!req.isAdmin) {
        return res.status(403>json({message: "Admins Only. Access denied."}))
    }
    const { _id, name, email } = await User.findById(req.user.id);
    res.status(200).json({
      id: _id,
      name,
      email,
    });
});

// @desc    Admin Login
// @route   POST /api/admin/adminlogin
const adminLogin = asyncHandler (async (req, res) => {
    const {email, password, isAdmin} = req.body 

    try {
        // Check for user by email
        const user = await userModel.findOne({email}); 
        if (!user) {
            return res.status(401).json({message: "Invalid username or password"}); 
        }

        // Check if user is an admin
        if (!user.isAdmin) {
            return res.status(403).json({message: "Access denied. You are not an admin." });
        }

         // Compare passwords
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
          return res.status(401).json({message: "Invalid password" });
        }

        // Generate JWT token
        const token = generateToken(user._id, user.isAdmin);

        // Respond with success message and token
        res.json({
            message: "Logged in successfully",
            token,
        });

    } catch (error) {
        console.error("Error during admin login:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
}); 

/// RESET PASSWORD!

module.exports = {
    registerUser,
    loginUser,
    recieveLoggedInUser, 
    adminLogin
};
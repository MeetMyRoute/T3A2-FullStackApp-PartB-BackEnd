const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler"); 
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
  };

// Register User 
const registerUser = asyncHandler (async (req, res) => {
    const {name, email, password, status, location, travelPreferences, socialMediaLink} = req.body; 

    // check fields have been filled in 
    if (!email || !password || !status || !location || !travelPreferences || !socialMediaLink) {
        return res.status(400).json({message: "Please fill in all fields"}); 
    }

    // check if user already exists
    const userExists = await User.findOne ({ email }); 
    if (userExists) {
        res.status(400).json({message:"User already exisits"}); 
    }

    // create hashed password 
    const hashedPassword = await bcrypt.hash(password, 10);

    // create a new user 
    const newUser = await User.create ({ // creates and saves user 
        name, 
        email, 
        password: hashedPassword,
        location, 
        travelPreferences, 
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
            travelPreferences: newUser.travelPreferences,
            socialMediaLink: newUser.socialMediaLink,
            token: generateToken(newUser._id),
        });
} else {
    return res.status(400).json({ message: 'Invalid user data' }); // Fixed 'request' to 'res'
}   
}); 

// Login User 
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      res.status(400).json({message: "Please add all fields" });
    }
  
    // Check for user email
    const user = await User.findOne({ email });
  
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({message: "Invalid credentials"});
    }
  });

module.exports = {
    registerUser,
    loginUser,
};

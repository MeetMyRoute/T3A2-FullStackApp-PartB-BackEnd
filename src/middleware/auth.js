const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { userModel } = require('../model/userModel');

const auth = asyncHandler (async (req, res, next) => {
    let token; 
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Receive token from header
            token = req.headers.authorization.split(" ")[1];

            // Verify token 
            const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN); 

            // Get user from the token 
            req.user = await userModel.findById(decoded.id).select("-password"); 

            // Check if the user is an admin and attach to the request
            req.isAdmin = decoded.isAdmin || false;

            next(); 
        } catch (error) {
            console.error("JWT verification failed:", error);
            res.status(401).json({message: "Unauthorised User"}); 
        }
    }
    if (!token) {
        res.status(401).json({message: "Not authorised, no token"})
    }
}); 

module.exports = { 
    auth, 
}; 


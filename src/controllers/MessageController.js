const { MessageModel } = require("../models/MessageModel");

// Send a message and store it in the database
const sendMessage = async (req, res) => {
    try {
        // Extract recipient ID and message from the request body
        const { recipientId, message } = req.body;

        // Extract sender ID from the authenticated user
        const senderId = req.user.id;
        
        // Check if recipientId and message are provided
        if (!recipientId) {
            return res.status(400).json({
                message: "Recipient and message are required"
            });
        }

        // Ensure users cannot send a message to themselves
        if (!recipientId === senderId) {
            return res.status(400).json({
                message: "You cannot send a message to yourself"
            });
        }

        // Store the message in the database
        const newMessage = await MessageModel.create({
            senderId,
            recipientId,
            message,
            timestamp: new Date()
        });

        // Send a success response with the newly created message
        return res.status(200).json({
            message: "Message sent successfully",
            data: newMessage
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error sending message:",
            error: error.message
        });
    }
}

// Get the list of users the logged-in user has exchanged messages with
const getConnects = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;

        // Fetch messages where the logged-in user is either the sender or the recipient
        const messages = await MessageModel.find({
            $or: [
                { senderId: loggedInUserId },
                { recipientId: loggedInUserId }
            ]
        })
            .populate("senderId", "name profilePic socialMediaLink")
            .populate("recipientId", "name profilePic socialMediaLink")
            // Sort by the most recent timestamp
            .sort({ timestamp: -1 });

        // Process and format unique connects
        // To track unique user IDs
        const connectsSet = new Set();
        const formattedConnects = [];
            
        messages.forEach((msg) => {
            // Determine the "other user" based on message direction
            const otherUser =
                msg.senderId._id.toString() === loggedInUserId
                    ? msg.recipientId
                    : msg.senderId;
                
            // Add unique users to the result set
            if (!connectsSet.has(otherUser._id.toString())) {
                connectsSet.add(otherUser._id.toString());
                formattedConnects.push({
                    userId: otherUser._id,
                    name: otherUser.name,
                    profilePic: otherUser.profilePic,
                    socialMediaLink: otherUser.socialMediaLink
                });
            }
        });
            
        // Return the list of unique connects
        return res.status(200).json({
            message: "Connects retrieved successfully",
            data: formattedConnects
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving connects",
            error: error.message
        });
    }
}

module.exports = {
    sendMessage,
    getConnects
}
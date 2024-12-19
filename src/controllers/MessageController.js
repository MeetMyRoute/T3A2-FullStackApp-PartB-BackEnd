const { MessageModel } = require("../models/MessageModel");

// Send a message and store in the database
const sendMessage = async(req, res) => {
    try {
        // Extract from request body
        const {recipientId, message} = req.body;

        // Extract from auth middleware
        const senderId = req.user.id;
        
        // Validate input
        if (!recipientId || !message) {
            return res.status(400).json({
                message: "Recipient and message are required"
            });
        }

        if (!recipientId || !message) {
            return res.status(400).json({
                message: "You cannot send a message to yourself"
            });
        }

        // Store message in the database
        const newMessage = await MessageModel.create({
            senderId,
            recipientId,
            message,
            timestamp: new Date()
        });

        // Send success response
        return res.status(200).json({
            message: "Connect message sent successfully",
            data: newMessage
        });
    } catch(error) {
        return res.status(500).json({
            message: "Error sending message:",
            error
        });
    }
}

// Get other user's information that have sent a message or the user has received a message from
const getConnects = async(req, res) => {
    try {
        const loggedInUserId = req.user.id;

        // Fetch messages where the user is either the sender or the recipient
        const connects = await MessageModel.find({
            $or: [
                {senderId: loggedInUserId},
                {recipientId: loggedInUserId}
            ]
        })
            .populate("senderId", "name profilePic socialMediaLink")
            .populate("recipientId", "name profilePic socialMediaLink")

            // Sort by most recent message
            .sort({timestamp: -1});

        // Process and format unique connects
        const connectsSet = new Set();
        const formattedConnects = [];
            
        connects.forEach((msg) => {

            // Extract user details based on message direction
            const otherUser =
                msg.senderId._id.toString() === loggedInUserId
                    ? msg.recipientId
                    : msg.senderId;
                
            if (!connectsSet.has(otherUser._id.toString())) {
                connectsSet.add(otherUser._id.toString());
                formattedConnects.push({
                    userId: otherUser._id,
                    name: otherUser.name,
                    profilePic: otherUser.profilePic,
                    socialMediaLink: otherUser.socialMediaLink
                });
            }
        })
            
        // Return the unique connects
        return res.status(200).json({
            message: "Connects retrieved successfully",
            data: formattedConnects
        });
    } catch(error) {
        return res.status(500).json({
            message: "Error retrieving connects:",
            error
        });
    }
}

module.exports = {
    sendMessage,
    getConnects
}
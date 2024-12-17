const { MessageModel } = require("../models/MessageModel");

// Send a message and store in the database
const sendConnectMessage = async(req, res) => {
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
const getUserConnections = async(req, res) => {
    try {
        // Extract from auth middleware
        const loggedInUserId = req.user.id;

        // Fetch messages where the user is the sender or recipient
        const connections = await MessageModel.find({
            $or: [

                // Messages sent by the user
                {senderId: loggedInUserId},

                // Messages received by the user
                {recipientId: loggedInUserId}
            ]
        })
            .populate("senderId", "name profilePic socialMediaLink")
            .populate("recipientId", "name profilePic socialMediaLink")

            // Sort by most recent message
            .sort({timestamp: -1});

            // Process and format unique connections
            const connectionSet = new Set();
            const formattedConnections = [];
            
            connections.forEach((msg) => {
                
                // Extract user details based on message direction
                const otherUser = msg.senderId._id.toString() === loggedInUserId
                    ? msg.recipientId
                    : msg.senderId;

                if (!connectionSet.has(otherUser._id.toString())) {
                    connectionSet.add(otherUser._id.toString());
                    formattedConnections.push({
                        userId: otherUser._id,
                        name: otherUser.name,
                        profilePic: otherUser.profilePic,
                        socialMediaLink: otherUser.socialMediaLink
                    });
                }
            });
            
            // Send response
            return res.status(200).json({
                message: "Connections retrieved successfully",
                data: formattedConnections
            });
    } catch(error) {
        return res.status(500).json({
            message: "Error retrieving connections:",
            error
        });
    }
}

module.exports = {
    sendConnectMessage,
    getUserConnections
}
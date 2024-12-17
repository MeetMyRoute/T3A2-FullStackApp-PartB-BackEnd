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

// Get all connect messages
const getConnectMessages = async(req, res) => {
    try {
        // Extract from auth middleware
        const userId = req.user.id;

        // Find messages where the user is the sender or recipient
        const messages = await MessageModel.find({
            $or: [

                // Messages sent by the user
                {senderId: userId},

                // Messages received by the user
                {recipientId: userId}
            ]
        })
            .populate("senderId", "name profilePic socialMediaLink")
            .populate("recipientId", "name profilePic socialMediaLink")

            // Sort by most recent message
            .sort({timestamp: -1});

            // Check if messages exist
            if (!messages.length) {
                return res.status(404).json({
                    message: "No connect messages found"
                });
            }

            // Format the results
            const formattedMessages = messages.map((msg) => {
                return {
                    id: msg._id,
                    sender: {
                        id: msg.senderId._id,
                        name: msg.senderId.name,
                        profilePic: msg.senderId.profilePic || null,
                        socialMediaLink: msg.senderId.socialMediaLink
                    },
                    recipient: {
                        id: msg.recipientId._id,
                        name: msg.recipientId.name,
                        profilePic: msg.recipientId.profilePic || null,
                        socialMediaLink: msg.recipientId.socialMediaLink
                    },
                    timestamp: msg.timestamp
                }
            });

            // Send response
            return res.status(200).json({
                message: "Connect messages retrieved successfully",
                data: formattedMessages
            });
    } catch(error) {
        return res.status(500).json({
            message: "Error retrieving connect messages:",
            error
        })
    }
}

module.exports = {
    sendConnectMessage,
    getConnectMessages
}
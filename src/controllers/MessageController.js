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

module.exports = {
    sendConnectMessage
}
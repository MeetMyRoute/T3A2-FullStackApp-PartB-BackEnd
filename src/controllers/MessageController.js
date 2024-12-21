const { MessageModel } = require("../models/MessageModel");
const { UserModel } = require("../models/UserModel");

// Send a message and store it in the database
const sendMessage = async (req, res) => {
    try {
        // Extract destination and recipient from the request body
        const { recipientId, destination } = req.body;

        // Extract sender ID from the authenticated user
        const senderId = req.user.id;
        
        // Validate input
        if (!recipientId) {
            return res.status(400).json({
                message: "Recipient and destination are required"
            });
        }

        // Ensure users cannot send a message to themselves
        if (!recipientId === senderId) {
            return res.status(400).json({
                message: "You cannot send a message to yourself"
            });
        }

        // Fetch recipient details
        const recipient = await UserModel.findById(recipientId).select("name location socialMediaLink");
        if (!recipient) {
            return res.status(404).json({
                message: "Recipient not found"
            });
        }

        // Generate the appropriate message
        let generatedMessage = "";
        if (recipient.location === destination) {
            generatedMessage = `Hey ${recipient.name}, I'm traveling to your city. Let's connect via social media!`;
        } else if (recipient.location != destination) {
            generatedMessage = `Hey ${recipient.name}, I'm traveling to your destination. Let's connect via social media!`;
        }

        // Store the message in the database
        const newMessage = await MessageModel.create({
            senderId,
            recipientId,
            message: generatedMessage,
            timestamp: new Date()
        });

        // Send a success response with the newly created message
        return res.status(200).json({
            message: "Message sent successfully",
            data: newMessage
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error sending message",
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
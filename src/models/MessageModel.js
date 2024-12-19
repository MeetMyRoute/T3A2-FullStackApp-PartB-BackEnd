const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

MessageSchema.index({senderId: 1, recipientId: 1});

const MessageModel = mongoose.model("Message", MessageSchema);

module.exports = {
    MessageModel
}
const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
		unique: true,
		match: /.+\@.+\..+/
    },
    password: {
        type: String,
        required: true,
		minLength: 6,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        required: true,
        enum: ["Private", "Travelling", "Local"]
    },
    travelPreferencesAndGoals: {
        type: [String]
    },
    socialMediaLink: {
        type: String
    },
})

const userModel = mongoose.model("User", UserSchema)

module.exports = {
    userModel
}
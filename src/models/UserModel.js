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
        trim: true,
        minLength: 2
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
    profilePic: {
        type: String,
    },
    travelPreferencesAndGoals: {
        type: [String]
    },
    socialMediaLink: {
        type: String,
        match: /^https?:\/\/(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+[^\s]*$/
    },
});

const UserModel = mongoose.model("User", UserSchema)

module.exports = {
    UserModel
}
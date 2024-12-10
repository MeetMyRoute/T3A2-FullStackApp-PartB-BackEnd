const { UserModel } = require('../models/UserModel');
const { dbConnect,dbDisconnect,dbDrop } = require("./database");
const bcrypt = require('bcryptjs');

require("dotenv").config();

const seedUsers = async () => {
    const users = [
        {
            name: "Jessica Turner",
            email: "jessicaturner@example.com",
            password: "password123", 
            isAdmin: false,
            location: "New York", 
            status: "Local", 
            travelPreferencesAndGoals: ["Beach", "Adventure"], 
            socialMediaLink: "https://facebook.com/jessicaturner" 
        },
        {
            name: "Josh Smith",
            email: "joshsmith@example.com",
            password: "password456", 
            isAdmin: false,
            location: "Los Angeles",
            status: "Travelling",
            travelPreferencesAndGoals: ["City Tours"],
            socialMediaLink: "https://twitter.com/joshsmith"
        },
        {
            name: "Alice Turner",
            email: "aliceturner@example.com",
            password: "mypassword789", 
            isAdmin: false,
            location: "San Francisco",
            status: "Private",
            travelPreferencesAndGoals: ["Mountain Hiking"],
            socialMediaLink: "https://instagram.com/aliceturner"
        },
        {
            name: "Kate Salmon",
            email: "katesalmon@example.com",
            password: "securepass123",
            isAdmin: true,
            location: "London",
            status: "Local",
            travelPreferencesAndGoals: ["Cultural Experiences"],
            socialMediaLink: "https://linkedin.com/katesalmon"
        },
    ];

    try {
        // Hash passwords before inserting
        for (let user of users) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }

        // Insert users into the database
        const createdUsers = await UserModel.insertMany(users);

        return createdUsers;
    } catch (error) {
        throw error;
    }
};

const dbSeed = async () => {
    try {
        // Connect to the database
        console.log('Connecting to the database...');
        await dbConnect();

        // Drop the database collections
        console.log('Resetting the database...');
        await dbDrop();

        // Seed users
        console.log('Seeding users...');
        const users = await seedUsers();

    } catch (error) {
        console.error('Error during the database seed process:', error.message);
    } finally {
        // Disconnect from the database
        console.log('Disconnecting from the database...');
        await dbDisconnect();
        console.log('Database seed process completed.');
    }
};

dbSeed();

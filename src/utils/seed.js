const { ItineraryModel } = require("../models/ItineraryModel");
const { MessageModel } = require("../models/MessageModel");
const { UserModel } = require("../models/UserModel");
const { dbConnect, dbDrop, dbDisconnect } = require("./database");
const bcrypt = require('bcryptjs');

require("dotenv").config();

const seedUsers = async () => {
    const users = [
        {
            name: "Jessica Turner",
            email: "jessicaturner@example.com",
            password: "password123", 
            status: "Travelling",
            isAdmin: false,
            location: "New York",
            travelPreferencesAndGoals: ["City Tours"],
            socialMediaLink: "https://twitter.com/jessicaturner"
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

const seedItineraries = async (users) => {
    const itineraries = [
        {
            userId: users[0]._id,
            destination: "London",
            startDate: "2025-02-02",
            endDate: "2025-02-19",
            accommodation: "Hilton London Hyde Park",
            activities: ["The British Museum", "Tower of London"]
        },
        {
           userId: users[0]._id,
           destination: "Lisbon",
           startDate: "2025-04-06",
           endDate: "2025-04-15",
           activities: ["Belem Tower"]
        },
        {
            userId: users[1]._id,
            destination: "Prague",
            startDate: "2025-06-22",
            endDate: "2025-06-25",
            accommodation: "Alfons Boutique Hotel"
        },
        {
            userId: users[1]._id,
            destination: "Lisbon",
            startDate: "2025-04-05",
            endDate: "2025-04-18"
        },
        {
            userId: users[2]._id,
            destination: "New Orleans",
            startDate: "2025-10-16",
            endDate: "2025-10-20",
            accommodation: "The Westin New Orleans",
            activities: ["Jackson Square", "New Orleans City Park"]
        },
        {
            userId: users[2]._id,
            destination: "Prague",
            startDate: "2025-06-12",
            endDate: "2025-06-28",
            activities: ["Prague Castle"]
        }
    ]

    try {
        const createdItineraries = await ItineraryModel.insertMany(itineraries);
        console.log("Itineraries seeded: ", createdItineraries);
    } catch(error) {
        console.log("Error seeding itineraries: ", error.message);
    }
}

const seedMessages = async (users) => {
    const messages = [
        {
            senderId: users[0]._id,
            recipientId: users[2]._id,
            message: "Hey Kate Salmon, I'm travelling to your city. Let's connect via social media!",
            timestamp: new Date("2024-23-09T10:00:00")
        },
        {
            senderId: users[1]._id,
            recipientId: users[0]._id,
            message: "Hey Jessica Turner, I'm travelling to your destination. Let's connect via social media!",
            timestamp: new Date("2024-12-03T14:00:00")
        },
        {
            senderId: users[2]._id,
            recipientId: users[1]._id,
            message: "Hey Alice Turner, I'm travelling to your destination. Let's connect via social media!",
            timestamp: new Date("2024-12-07T18:00:00")
        }
    ]

    try {
        const createdMessages = await MessageModel.insertMany(messages);
        console.log("Messages seeded: ", createdMessages);
    } catch (error) {
        console.log("Error seeding messages: ", error.message);
    }
}

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

        // Seed itineraries with user references
        console.log("Seeding itineraries...");
        await seedItineraries(users);

        // Seed messages between users
        console.log("Seeding messages...");
        await seedMessages(users);

        console.log("Database seed process completed");
    } catch (error) {
        console.error('Error during the database seed process:', error.message);
    } finally {
        // Disconnect from the database
        console.log('Disconnecting from the database...');
        await dbDisconnect();
    }
};

// Run the seeder
dbSeed();
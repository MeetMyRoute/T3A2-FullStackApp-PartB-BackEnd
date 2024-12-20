const { ItineraryModel } = require("../models/ItineraryModel");
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

const seedItineraries = async(users) => {
    const itineraries = [
        {
            userId: users[0]._id,
            destination: "London",
            startDate: "2025-01-15",
            endDate: "2025-01-19",
            accommodation: "Hilton London Hyde Park",
            activities: ["The British Museum", "Tower of London"]
        },
        {
           userId: users[0]._id,
           destination: "Lisbon",
           startDate: "2025-02-08",
           endDate: "2025-02-12",
           accommodation: "Hotel da Baixa",
           activities: ["Belem Tower"]
        },
        {
            userId: users[1]._id,
            destination: "Prague",
            startDate: "2025-03-12",
            endDate: "2025-03-19",
            accommodation: "Alfons Boutique Hotel",
            activities: ["Prague Castle", "Charles Bridge"]
        },
        {
            userId: users[1]._id,
            destination: "Cairo",
            startDate: "2025-04-10",
            endDate: "2025-04-19",
            accommodation: "Sofitel Cairo Nile El Gezirah",
            activities: ["The Egyptian Museum in Cairo"]
        },
        {
            userId: users[2]._id,
            destination: "New Orleans",
            startDate: "2025-01-23",
            endDate: "2025-01-29",
            activities: ["Jackson Square", "New Orleans City Park"]
        },
        {
            userId: users[2]._id,
            destination: "Cairo",
            startDate: "2025-04-11",
            endDate: "2025-04-13",
        }
    ]

    try {
        const createdItineraries = await ItineraryModel.insertMany(itineraries);
        console.log("Itineraries seeded: ", createdItineraries);
    } catch(error) {
        console.log("Error seeding itineraries: ", error.message);
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
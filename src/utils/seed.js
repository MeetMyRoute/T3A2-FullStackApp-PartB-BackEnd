const { ItineraryModel } = require("../models/ItineraryModel");
const { dbConnect, dbDrop, dbDisconnect } = require("./database");

require("dotenv").config();

// const seedUsers = async() => {}

const seedItineraries = async(users) => {
    const itineraries = [
        {
            userId: users[0]._id,
            destination: "Melbourne",
            startDate: "2025-01-15",
            endDate: "2025-01-19",
            accommodation: "W Melbourne",
            activities: ["Royal Botanic Gardens Victoria", "National Gallery of Victoria"]
        },
        {
           userId: users[0]._id,
           destination: "Lisbon",
           startDate: "2025-02-08",
           endDate: "2025-02-12",
           activities: ["Belem Tower"]
        },
        {
            userId: users[1]._id,
            destination: "Prague",
            startDate: "2025-03-12",
            endDate: "2025-03-19",
            accommodation: "The Julius Prague"
        },
        {
            userId: users[1]._id,
            destination: "Cairo",
            startDate: "2025-04-10",
            endDate: "2025-04-19"
        }
    ]

    try {
        const createdItineraries = await ItineraryModel.insertMany(itineraries);
        console.log("Itineraries seeded: ", createdItineraries);
    } catch(error) {
        console.log("Error seeding itineraries: ", error.message);
    }
}

const dbSeed = async() => {
    try{
        // Connect to the database
        await dbConnect();

        // Reset the database
        await dbDrop();

        // Seed users
        // const users = await seedUsers();

        // Seed itineraries with user references
        await seedItineraries(users);

        console.log("Database seeded");
    } catch(error) {
        console.log("Error seeding database: ", error.message);
    } finally {
        // Disconnect from the database in all cases
        await dbDisconnect();
    }
}

// Run the seeder
dbSeed();
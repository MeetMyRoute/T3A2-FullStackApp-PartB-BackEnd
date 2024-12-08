const { userModel } = require('../model/userModel');
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
        },
        {
            name: "Josh Smith",
            email: "joshsmith@example.com",
            password: "password456", 
            isAdmin: false,
        },
        {
            name: "Alice Turner",
            email: "aliceturner@example.com",
            password: "mypassword789", 
            isAdmin: false,
        },
        {
            name: "Kate Salmon",
            email: "katesalmonexample.com",
            password: "securepass123",
            isAdmin: true,
        },
    ];

    try {
        // Hash passwords before inserting
        for (let user of users) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }

        // Insert users into the database
        const createdUsers = await userModel.insertMany(users);
        return createdUsers;
    } catch (error) {
        throw error;
    }
};

// const dbSeed = async () => {
//     try {
//         // Connect to the database
//         await dbConnect();

//         // Reset the database
//         await dbDrop();

//         // Seed users
//         const users = await seedUsers();

//         console.log("Database seeded successfully");
//     } catch (error) {
//         console.log("Error seeding database: ", error.message);
//     } finally {
//         // Disconnect from the database in all cases
//         await dbDisconnect();
//     }
// };

dbSeed();

const request = require('supertest');
const { UserModel } = require('../models/UserModel');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { app } = require('../server');
const jwt = require('jsonwebtoken');

jest.setTimeout(60000);

console.log('TEST_DB_URI:', process.env.TEST_DB_URI);

beforeAll(async () => {
  require('dotenv').config();
  // Connect to the test database
  await mongoose.connect(process.env.TEST_DB_URI);
});

afterAll(async () => {
  // Close the database connection
  await mongoose.connection.close();
  console.log('Test DB disconnected');
});

beforeEach(async () => {
  // Clear the database before each test suite
  await UserModel.deleteMany({});
});

describe('POST /user/login', () => {

  it('should log in the user with valid credentials and return a token', async () => {
    // Create a user with a hashed password and a name field
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.create({
      name: 'Jessica Turner', 
      email: 'jessicaturner@example.com',
      password: hashedPassword,
      status: 'Local',
      location: 'New York', 
      travelPreferencesAndGoals: ["Beach", "Adventure"],
      socialMediaLink: 'https://facebook.com/jessicaturner',
    });

    // Send login request
    const res = await request(app)
      .post('/user/login')
      .send({
        email: 'jessicaturner@example.com',
        password: password,
      });

    // Expect the response to contain a token and user details
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.name).toBe('Jessica Turner');
    expect(res.body.user.email).toBe('jessicaturner@example.com');

    // Verify the token
    const decodedToken = jwt.decode(res.body.token);
    expect(decodedToken).toHaveProperty('id');
  });

  it('should return 404 when the user does not exist', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

    // Not Found response (404)
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Sorry, no user found with this email. Please check your login details.');
  });

  it('should return 401 when the password is incorrect', async () => {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.create({
      name: 'Jessica Turner', 
      email: 'jessicaturner@example.com',
      password: hashedPassword,
      status: 'Local',
      location: 'New York',
      travelPreferencesAndGoals: ["Beach", "Adventure"],
      socialMediaLink: 'https://facebook.com/jessicaturner',
    });

    // Send a login request with an incorrect password
    const res = await request(app)
      .post('/user/login')
      .send({
        email: 'jessicaturner@example.com',
        password: 'wrongpassword',
      });

    // Unauthorized response (401)
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Incorrect password. Please try again.');
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({});

    // Bad Request response (400)
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Please provide both email and password.');
  });
});
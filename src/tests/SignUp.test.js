const request = require('supertest');
const { UserModel } = require('../models/UserModel');
const mongoose = require('mongoose');
const { app } = require('../server'); 

jest.setTimeout(60000);

// Database setup before tests
beforeAll(async () => {
  require('dotenv').config();
  await mongoose.connect(process.env.TEST_DB_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
  console.log('Test DB disconnected');
});

beforeEach(async () => {
  await UserModel.deleteMany({});
});

// User data for testing
const validUser = {
  name: 'Josh Smith',
  email: 'joshsmith@example.com',
  password: 'password456',
  status: 'Travelling',
  location: 'Los Angeles',
  travelPreferencesAndGoals: ["City Tours"],
  socialMediaLink: 'https://twitter.com/joshsmith',
};

const registerUser = (userData) => {
  return request(app)
    .post('/user')
    .send(userData);
};

describe('POST /user/', () => {
  it('should successfully register a new user with valid details', async () => {
    const res = await registerUser(validUser);

    console.log("API response body for valid user registration:", res.body);

    // Successful user creation (201)
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined(); 
    expect(res.body.name).toBe(validUser.name); 
    expect(res.body.email).toBe(validUser.email);
    expect(res.body.status).toBe(validUser.status);
    expect(res.body.location).toBe(validUser.location);
    expect(res.body.travelPreferencesAndGoals).toEqual(validUser.travelPreferencesAndGoals);
    expect(res.body.socialMediaLink).toBe(validUser.socialMediaLink);
    expect(res.body.profilePic).toBeNull();
  });

  it('should return 400 when required fields are missing', async () => {
    const { email, password } = validUser;
    const incompleteUser = { email, password };

    const res = await registerUser(incompleteUser);

    // When fields are missing (400)
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Please fill in all fields');
  });

  it('should return 400 when the user already exists', async () => {
    await registerUser(validUser);

    // Registering the same user again
    const res = await registerUser(validUser);

    // If user already exists (400)
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists with this email.');
  });

  it('should return 500 if there is an internal server error', async () => {
    jest.spyOn(UserModel, 'create').mockRejectedValueOnce(new Error('Internal server error'));

    const res = await registerUser(validUser);

    // Internal server error (500)
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('An error occurred while registering the user. Please try again later.');
  });

  it('should return 400 when user details are invalid', async () => {
    const { email, status, location, travelPreferencesAndGoals, socialMediaLink } = validUser;
    const invalidUser = { email, status, location, travelPreferencesAndGoals, socialMediaLink }; // Missing 'password' and 'name'

    const res = await registerUser(invalidUser);

    // If there are missing fields (400)
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Please fill in all fields');
  });
});
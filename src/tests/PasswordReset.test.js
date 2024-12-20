const nodemailer = require('nodemailer');
const { UserModel } = require('../models/UserModel'); 
const request = require('supertest');
const { app } = require('../server');

jest.setTimeout(60000);

// Mocking nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue('Email sent'),
  }),
}));

describe('POST /user/forgetPassword', () => {
  beforeEach(() => {
    nodemailer.createTransport().sendMail.mockClear();
  });

  it('should return 400 if email format is invalid', async () => {
    const res = await request(app)
      .post('/user/forgetPassword')
      .send({ email: 'invalidemail.com' }); 

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid email format');
  });

  it('should return 404 if user not found', async () => {
    jest.spyOn(UserModel, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .post('/user/forgetPassword')
      .send({ email: 'nonexistentuser@example.com' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('No user found with this email address.');
  });

  it('should return 200 and send an email if email is valid', async () => {
    jest.spyOn(UserModel, 'findOne').mockResolvedValue({
      email: 'user@example.com',
      name: 'Test User',
    });

    const res = await request(app)
      .post('/user/forgetPassword')
      .send({ email: 'user@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Password reset email sent');
    expect(nodemailer.createTransport().sendMail).toHaveBeenCalled();
    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Password Reset',
      })
    );
  });

  it('should return 500 if an error occurs', async () => {
    jest.spyOn(UserModel, 'findOne').mockResolvedValue({
      email: 'user@example.com',
      name: 'Test User',
    });
    nodemailer.createTransport().sendMail.mockRejectedValue(new Error('Email sending error'));

    const res = await request(app)
      .post('/user/forgetPassword')
      .send({ email: 'user@example.com' });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('An error occurred. Please try again later.');
  });
});
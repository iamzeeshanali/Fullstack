import express from 'express';
const router = express.Router();
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserService from '../controllers/authController.mjs';
import { config } from 'dotenv';

config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-jwt-secret';

// Centralized error response helper
const sendErrorResponse = (res, statusCode, message, errorCode, details = {}) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    errorCode,
    details,
  });
};

/**
 * @route POST /register
 * @desc Register a new user and issue a JWT
 * @access Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors during registration:', errors.array());
      return sendErrorResponse(res, 400, 'Validation failed', 'VALIDATION_ERROR', {
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    try {
      // Check if email already exists
      const userExists = await UserService.checkUserExists(email);
      if (userExists) {
        console.log(`Registration attempt with existing email: ${email}`);
        return sendErrorResponse(res, 409, 'Email already exists', 'EMAIL_EXISTS', { email });
      }

      // Create new user
      const newUser = await UserService.createUser({ email, password });

      // Generate JWT
      const payload = {
        userId: newUser.id,
        email: newUser.email,
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      console.log(`User registered successfully: ${email}`);
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          userId: newUser.id,
          email: newUser.email,
          token,
        },
      });
    } catch (error) {
      console.error(`Error during user registration: ${error.message}`);
      return sendErrorResponse(res, 500, 'Internal server error', 'SERVER_ERROR');
    }
  }
);

/**
 * @route POST /login
 * @desc Authenticate a user and issue a JWT
 * @access Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors during login:', errors.array());
      return sendErrorResponse(res, 400, 'Validation failed', 'VALIDATION_ERROR', {
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    try {
      const user = await UserService.findUserByEmail(email);
      if (!user) {
        console.log(`Login attempt with non-existent email: ${email}`);
        return sendErrorResponse(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log(`Invalid password attempt for email: ${email}`);
        return sendErrorResponse(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
      }

      const payload = {
        userId: user.id,
        email: user.email,
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      console.log(`User logged in successfully: ${email}`);
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          userId: user.id,
          email: user.email,
          token,
        },
      });
    } catch (error) {
      console.error(`Error during user login: ${error.message}`);
      return sendErrorResponse(res, 500, 'Internal server error', 'SERVER_ERROR');
    }
  }
);

export default router;

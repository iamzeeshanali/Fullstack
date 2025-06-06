// // controllers/authController.js
// import { hash, compare } from 'bcrypt';
// import userModel from '../models/userModel.mjs';

// export const register = async (req, res) => {
//   console.log('register==')
//   const { username, password } = req.body;
//   let responseBody = null;
//   try {
//     console.log(username, 'register')
//     const existingUser = await userModel.getUserByUsername(username);
//     if (existingUser) {
//       responseBody = {
//         status: "error",
//         message: "Email already exists",
//         errorCode: "EMAIL_EXISTS",
//         details: {
//           email: username
//         }
//       }
//       return res.status(403).json(responseBody);
//     }
//     const hashedPassword = await hash(password, 10);
//     const createdUser = await userModel.createUser(username, hashedPassword);
//     responseBody = {
//       status: "success",
//       message: "User registered successfully",
//       data: {
//         userId: createdUser.insertId,
//         email: username
//       }
//     }
//     res.status(201).json(responseBody);
//   } catch (err) {
//     responseBody = {
//       status: "error",
//       message: "Internal server error",
//       errorCode: "SERVER_ERROR"
//     }
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// export const login = async (req, res) => {
//   const { username, password } = req.body;
//   try {
//     const user = await userModel.getUserByUsername(username);
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }
//     const match = await compare(password, user.password);
//     if (!match) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }
//     // For simplicity, just respond success. You can implement JWT here.
//     res.json({ message: 'Login successful' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };


import User from'../models/userModel.mjs';
import bcrypt from'bcrypt';

class UserService {
  /**
   * Check if a user exists by email
   * @param {string} email - The email to check
   * @returns {Promise<boolean>} - True if user exists, false otherwise
   */
  static async checkUserExists(email) {
    try {
      const user = await User.findOne({ where: { email } });
      return !!user;
    } catch (error) {
      throw new Error(`Failed to check user existence: ${error.message}`);
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data (email, password)
   * @returns {Promise<Object>} - Created user object
   */
  static async createUser({ email, password }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ email, password: hashedPassword });
      return user;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

    /**
   * Find a user by email (includes password for login)
   * @param {string} email - The email to search for
   * @returns {Promise<Object|null>} - User object or null if not found
   */
  static async findUserByEmail(email) {
    try {
      const user = await User.findOne({ where: { email } });
      return user;
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }
}

export default UserService;
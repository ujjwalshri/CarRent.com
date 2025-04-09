/**
 * Authentication Controllers Module
 * 
 * This module handles all authentication-related operations for the car rental platform,
 * including user signup, login, retrieving current user, and logout functionality.
 * It manages token generation, password hashing, and user session management.
 * 
 * @module controllers/auth.controllers
 */

import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import validateUser from '../validation/user.validate.js';
import {generateTokenAndSetCookie} from '../utils/gen.token.js';
import { generateWelcomeMail} from '../utils/gen.mail.js';

/**
 * User Signup Controller
 * 
 * Registers a new user in the system with validation for duplicate username/email.
 * Hashes the password for security and generates a welcome email to the new user.
 * 
 * @async
 * @function signupController
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user information
 * @param {string} req.body.username - Unique username for the user
 * @param {string} req.body.password - User's password (will be hashed)
 * @param {string} req.body.firstName - User's first name
 * @param {string} req.body.lastName - User's last name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.city - User's city
 * @param {string} req.body.adhaar - User's Adhaar identification number
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user details or error message
 */
export const signupController = async (req, res) => {
    const { username, password, firstName, lastName, email, city, adhaar } = req.body;
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
       const userData = {
              username,
              password,
              firstName,
              lastName,
              email,
              city,
              adhaar
       }

       // validate the user before proceeding
       const validUser = validateUser(userData);
       if(validUser.error){
           return res.status(400).json({ err: `error ${validUser.error}` });
       }
       // Check for existing username
       const existingUsername = await User.findOne({ username });
       if (existingUsername) {
           return res.status(400).json({ message: "Username already exists" });
       }

       // Check for existing email
       const existingEmail = await User.findOne({ email });
       if (existingEmail) {
           return res.status(400).json({ message: "Email already exists" });
       }

       const user = new User({
              username,
              password: hashedPassword,
              firstName,
              lastName,
              email,
              city, 
              adhaar
       })

        await user.save();

        if(user){
            await generateTokenAndSetCookie(user, res); // Generate token and set cookie
            
            // generate the welcome email
            generateWelcomeMail(user).catch((err) => {
                console.error(`Error sending welcome email: ${err.message}`);
            });
            
            return  res.status(201).json({ 
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                city: user.city,
                isAdmin: user.isAdmin,
                isSeller: user.isSeller,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                adhaar: user.adhaar
             });
        }else {
            return res.status(400).json({ err: "Invalid user data" });
        }
       
    } catch (error) {
        res.status(500).json({ message: `error in the singup controller ${error.message}` });
        if (!res.headersSent) {
            return res.status(500).json({ err: `Internal server error: ${error}` });
        } else {
            console.error('Response headers already sent', error);
        }
    }
}

/**
 * User Login Controller
 * 
 * Authenticates a user with username and password.
 * Verifies that user is not blocked and password matches stored hash.
 * 
 * @async
 * @function loginController
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - User's username
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user details or error message
 */
export const loginController = async (req, res) => {
    const { username, password } = req.body;
    try{
        const user = await User.findOne({ username : username });
        if(user.isBlocked){
            return res.status(401).json({ err: "User is blocked" });
        }
        if(user){
            const isMatch = await bcrypt.compare(password, user.password);
            
            if(isMatch){
                await generateTokenAndSetCookie(user, res); // Generate token and set cookie
                return res.status(200).json({
                    _id: user._id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    city: user.city,
                    isSeller: user.isSeller,
                    isAdmin: user.isAdmin,
                    isBlocked: user.isBlocked,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                });
            }else{
                return res.status(401).json({ err: "Invalid password" });
            }
        }else{
            return res.status(401).json({ err: "Invalid username " });
        }

    }catch(err){
        res.status(500).json({ message: `error in the login controller ${err.message}` });
        if (!res.headersSent) {
            return res.status(500).json({ err: `Internal server error: ${err}` });
        } else {
            console.error('Response headers already sent', err);
        }
    }
}

/**
 * Get Current User Controller
 * 
 * Retrieves information about the currently logged-in user
 * based on the JWT token from cookies.
 * 
 * @async
 * @function meController
 * @param {Object} req - Express request object with user info from auth middleware
 * @param {Object} req.user - User ID extracted from JWT token
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with current user details or error message
 */
export const meController = async (req, res) => {
    // check if the user is already cached in redis
    const userId = req.user;
   
    try{
        const userId = req.user;
        const user = await User.findById(userId);
        if(user){
          

            return res.status(200).json({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                city: user.city,
                isSeller: user.isSeller,
                isAdmin: user.isAdmin,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            });
        }else{

            return res.status(404).json({ err: "User not found" });
        }

    }catch(err){
        res.status(500).json({ message: `error in the me controller ${err.message}` });
    }
}

/**
 * User Logout Controller
 * 
 * Logs out a user by clearing the JWT cookie.
 * 
 * @async
 * @function logoutController
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirming successful logout
 */
export const logoutController = async (req, res) => {
    try{
        res.clearCookie('jwt');
        res.status(200).json({ message: "Logged out successfully" });
    }catch(err){
        res.status(500).json({ message: `error in the logout controller ${err.message}` });
    }
}
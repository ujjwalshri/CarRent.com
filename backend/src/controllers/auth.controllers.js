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
import { generateWelcomeMail } from '../utils/gen.mail.js';
import { sendVerificationEmail } from '../utils/email.service.js';
import crypto from 'crypto';

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
    
  
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
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

       // Generate verification token
       const verificationToken = crypto.randomBytes(32).toString('hex');
       const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

       const user = new User({
              username,
              password: hashedPassword,
              firstName,
              lastName,
              email,
              city, 
              adhaar,
              verificationToken,
              verificationTokenExpires,
              isEmailVerified: false
       });

        await user.save();

        if(user){
            // Send verification email 
            try {
                await sendVerificationEmail({
                    email: user.email,
                    firstName: user.firstName,
                    verificationToken: user.verificationToken
                });
            } catch (err) {
                console.error(`Error sending verification email: ${err.message}`);
            }
            
            return res.status(201).json({ 
                message: "Registration successful! Please check your email to verify your account.",
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                city: user.city,
                isAdmin: user.isAdmin,
                isSeller: user.isSeller,
                isBlocked: user.isBlocked,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                adhaar: user.adhaar
             });
        } else {
            return res.status(400).json({ err: "Invalid user data" });
        }
       
    } catch (error) {
        res.status(500).json({ message: `error in the signup controller ${error.message}` });
        if (!res.headersSent) {
            return res.status(500).json({ err: `Internal server error: ${error}` });
        } else {
            console.error('Response headers already sent', error);
        }
    }
}

export const verifyEmailController = async (req, res) => {
    try {
        const { token } = req.params;
        
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired verification token"
            });
        }

        // Update user verification status
        user.isEmailVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;
        await user.save();

        // Now send the welcome email since the account is verified
        generateWelcomeMail(user).catch((err) => {
            console.error(`Error sending welcome email: ${err.message}`);
        });

        await generateTokenAndSetCookie(user, res);

        // Redirect to the verification success page
        res.redirect('http://localhost:5500/frontend/src/#!/verified');

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            message: "Error verifying email"
        });
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
        
        if(!user){
            return res.status(401).json({ err: "Invalid username" });
        }

        if(user.isBlocked){
            return res.status(401).json({ err: "User is blocked by the admin" });
        }

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
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            });
        }else{
            return res.status(401).json({ err: "Invalid password" });
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
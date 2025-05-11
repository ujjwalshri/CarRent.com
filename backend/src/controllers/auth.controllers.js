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
import Token from '../models/token.model.js';
import bcrypt from 'bcryptjs';
import validateUser from '../validation/user.validate.js';
import {generateTokenAndSetCookie} from '../utils/gen.token.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../services/email.service.js';
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
    const { username, password, firstName, lastName, email } = req.body;
    
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userData = {
            username,
            password,
            firstName,
            lastName,
            email,
        }

        const validUser = validateUser(userData);
        if(validUser.error){
            return res.status(400).json({ err: `error ${validUser.error}` });
        }

        // check if the user is present in the database and if the email is not registered 
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already exists" });
        }

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
            isEmailVerified: false
        });

        await user.save();

        if(user) {

            const verificationToken = crypto.randomBytes(32).toString('hex');
            
            const token = new Token({
                userId: user._id,
                token: verificationToken,
                type: 'email_verification',
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000) 
            });
            
            await token.save();

            try {
                await sendVerificationEmail({
                    email: user.email,
                    firstName: user.firstName,
                    verificationToken: verificationToken
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

/**
 * @async
 * @function verifyEmailController
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.token - Verification token
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user details or error message
 */
export const verifyEmailController = async (req, res) => {
    try {
        const { token } = req.params;
        
        // Find the token document
        const verificationToken = await Token.findOne({
            token: token,
            type: 'email_verification',
            expires: { $gt: Date.now() }
        });

        if (!verificationToken) {
            return res.status(400).json({
                message: "Invalid or expired verification token"
            });
        }

        // Find and update the user
        const user = await User.findById(verificationToken.userId);
        
        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        // Update user verification status
        user.isEmailVerified = true;
        await user.save();

        // Delete the used token
        await Token.deleteOne({ _id: verificationToken._id });

        // Now send the welcome email since the account is verified
        sendWelcomeEmail(user).catch((err) => {
            console.error(`Error sending welcome email: ${err.message}`);
        });

        // Redirect to the verification success page
        res.redirect('http://localhost:5500/#!/verified');

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            message: "Error verifying email"
        });
    }
}

/**
 * function to resend the verification email to the user 
 * @param {*} req 
 * @param {*} res 
 * @returns send the verification email to the user and return the response if successful else return the error
 * @async 
 * @function resendVerificationEmailController
 */
export const resendVerificationEmailController = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }


        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        await Token.deleteMany({ 
            userId: user._id, 
            type: 'email_verification'
        });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        

        const token = new Token({
            userId: user._id,
            token: verificationToken,
            type: 'email_verification',
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000) 
        });
        
            await token.save();

            await sendVerificationEmail({
                email: user.email,
                firstName: user.firstName,
                verificationToken: verificationToken
            });

            return res.status(200).json({ 
                message: "Verification email has been resent successfully" 
            });
    } catch (error) {
        console.error('Resend verification error:', error);
        return res.status(500).json({
            message: "Error resending verification email"
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
        

        if(user.isEmailVerified === false || user.isEmailVerified === undefined){
            // If the user is not verified, send a verification email
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const token = new Token({
                userId: user._id,
                token: verificationToken,
                type: 'email_verification',
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000) 
            });
            await token.save();
             sendVerificationEmail({
                email: user.email,
                firstName: user.firstName,
                verificationToken: verificationToken
            }).catch((err)=>{
                console.error(`Error sending verification email: ${err.message}`);
            })
            return res.status(401).json({ err: "User is not verified. Please check your email to verify your account." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if(isMatch){
            await generateTokenAndSetCookie(user, res); 
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

    try{
        const userId = req.user._id;
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
                isEmailVerified: user.isEmailVerified,
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
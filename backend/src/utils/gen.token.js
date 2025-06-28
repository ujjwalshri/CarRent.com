/**
 * JWT Token Generation Utility
 * @module utils/gen.token
 */
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

/**
 * Generates a JWT token and sets it as an HTTP-only cookie
 * 
 * @async
 * @function generateTokenAndSetCookie
 * @param {Object} user - User object containing user information 
 * @param {string} user.id - User ID to be included in the token payload
 * @param {Object} res - Express response object used to set the cookie
 * @returns {Promise<void>} - Promise that resolves when token is generated and cookie is set
 * @description
 * This function creates a JWT with the user ID, signs it using the JWT_SECRET
 * environment variable, and sets it as an HTTP-only cookie in the response.
 * The cookie expires after 24 hours.
 */
export const generateTokenAndSetCookie = async(user, res) => {
  // Generate token with user ID as payload
  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
  );

  // Set cookie with token and security options
  res.cookie("jwt", token, {
     maxAge: 24*60*60*1000, // 24 hours in milliseconds
     httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
   
  });
};



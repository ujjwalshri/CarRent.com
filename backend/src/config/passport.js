/**
 * Passport JWT Authentication Configuration
 * Sets up JWT authentication strategy using cookies
 * @module config/passport
 */
import passport from "passport";
import { Strategy } from "passport-jwt";
import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * Extracts JWT token from cookies in the request
 * 
 * @function cookieExtractor
 * @param {Object} req - Express request object
 * @returns {string|null} - JWT token from cookie or null if not present
 * @description
 * Helper function that extracts the JWT token from the request cookies.
 * Used by the passport strategy to locate and parse the authentication token.
 */
const cookieExtractor = (req) => {
  return req && req.cookies ? req.cookies.jwt : null;
};

/**
 * Configuration options for JWT strategy
 * 
 * @constant {Object} opts
 * @property {Function} jwtFromRequest - Function to extract JWT from request
 * @property {string} secretOrKey - Secret key for verifying token signature
 * @description
 * Defines how passport should extract the JWT token and what secret
 * should be used to verify the token's signature.
 */
const opts = {
  jwtFromRequest: cookieExtractor, 
  secretOrKey: process.env.JWT_SECRET,
};

/**
 * Configures and registers the JWT authentication strategy
 * 
 * @description
 * Sets up the JWT strategy for passport. When a protected route is accessed,
 * this strategy extracts the JWT from cookies, verifies it using the secret key,
 * and retrieves the corresponding user from the database. The user object is then
 * attached to the request for use in route handlers.
 */
passport.use(
  new Strategy(opts, async (jwt_payload, done) => {
    try {
      // Find user by ID from JWT payload without returning password
      const user = await User.findById(jwt_payload.id).select("-password");
     
      if (user) {
        // User found, pass user object to the next middleware
        return done(null, user);
      }
      // No user found with the ID from JWT payload
      return done(null, false);
    } catch (err) {
      // Error occurred during user lookup
      return done(err, false);
    }
  })
);

export default passport;
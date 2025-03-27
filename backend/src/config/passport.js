import passport from "passport";
import { Strategy } from "passport-jwt";
import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

/*
function to extract the jwt token from the cookie
*/
const cookieExtractor = (req) => {
  return req && req.cookies ? req.cookies.jwt : null;
};
/*
options for the passport strategy
*/
const opts = {
  jwtFromRequest: cookieExtractor, 
  secretOrKey: process.env.JWT_SECRET,
};
/*
passport strategy to authenticate the user
*/
passport.use(
  new Strategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id).select("-password");
     
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

export default passport;
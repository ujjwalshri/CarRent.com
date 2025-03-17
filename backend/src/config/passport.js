import passport from "passport";
import { Strategy } from "passport-jwt";
import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

const cookieExtractor = (req) => {
  return req && req.cookies ? req.cookies.jwt : null;
};

const opts = {
  jwtFromRequest: cookieExtractor, 
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new Strategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id).select("-password");
      console.log(user);
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
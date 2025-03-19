import passport from "passport";

const protectRoute = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {

    if (err || !user) {
      return res.status(401).json({ err: "Unauthorized: Invalid or missing token" });
    }
    req.user = user;
    next();
  })(req, res, next);
};

export default protectRoute;
import passport from "passport";
/* 
  This middleware is used to protect routes that require authentication.
  It uses the passport.authenticate method to authenticate the user using the jwt strategy.
  If the user is authenticated, the user object is attached to the request object.
  If the user is not authenticated, a 401 Unauthorized response is sent.
*/
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
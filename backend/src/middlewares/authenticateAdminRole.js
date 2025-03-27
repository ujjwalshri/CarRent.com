/*
This middleware is used to protect the routes from the admin.
If the user is not an admin, then the user is allowed to access the route.
If the user is an admin, then the user is not allowed to access the route.
*/
const protectFromAdmin = (req, res, next) => {
    
   const user = req.user;
    if(!user.isAdmin){
         next();
    }
    else{
        res.status(401).json({message: 'Unauthorized access'});
    }
  }

export default protectFromAdmin;

/*
    This middleware is used to protect the routes from the user.
    It checks if the user is a seller or an admin.
    If the user is a seller or an admin, the request is passed to the next middleware.
    If the user is not a seller or an admin, a 401 Unauthorized response is sent.
*/
const protectFromUser = (req, res, next) => {
    const user = req.user;
     if(user.isSeller || user.isAdmin){
          next();
     }
     else{
         res.status(401).json({message: 'Unauthorized access'});
     }
}
 
 export default protectFromUser;
/*
This middleware is used to protect routes from sellers. 
If the user is not a seller, then the user is allowed to access the route. 
If the user is a seller, then the user is not allowed to access the route.
*/
const protectFromSeller = (req, res, next) => {
    const user = req.user;
     if(!user.isSeller || user.isAdmin){
          next();
     }
     else{
         res.status(401).json({message: 'Unauthorized access'});
     }
   }
 
 export default protectFromSeller;
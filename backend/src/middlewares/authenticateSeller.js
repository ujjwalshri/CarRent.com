/*
This middleware is used to allow seller to the route
If the user is not a seller, then the user is allowed to access the route. 
*/
const allowSeller = (req, res, next) => {
    const user = req.user;
     if(user.isSeller){
          next();
     }
     else{
         res.status(401).json({message: 'Unauthorized access'});
     }
   }
 
 export default allowSeller;
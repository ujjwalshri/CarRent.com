
/*
    This middleware is used allow user 
    It checks if the user is a buyer
*/
const allowUser = (req, res, next) => {
    const user = req.user;
     if(user.isSeller=== false){
          next();
     }
     else{
         res.status(401).json({message: 'Unauthorized access'});
     }
}
 
 export default allowUser;
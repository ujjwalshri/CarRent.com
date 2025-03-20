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
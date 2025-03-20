
const protectFromSeller = (req, res, next) => {
    const user = req.user;
     if(!user.isSeller){
          next();
     }
     else{
         res.status(401).json({message: 'Unauthorized access'});
     }
   }
 
 export default protectFromSeller;
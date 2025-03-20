
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
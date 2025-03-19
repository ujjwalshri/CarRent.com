import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import validateUser from '../validation/user.validate.js';
import {generateTokenAndSetCookie} from '../utils/gen.token.js';


export const signupController = async (req, res) => {
    const { username, password, firstName, lastName, email, city,adhaar } = req.body;
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
       const userData = {
              username,
              password,
              firstName,
              lastName,
              email,
              city,
              adhaar
       }
       
       const user = new User({
              username,
              password: hashedPassword,
              firstName,
              lastName,
              email,
              city, 
              adhaar
       })
      
        // const validUser = validateUser(userData);
        // if(validUser.error){
        //     console.log("validate to hua");
        //     return res.status(400).json({ err: `error ${validUser.error}` });
        // }
        
        await user.save();
        console.log("save bhi hua")

        if(user){
            await generateTokenAndSetCookie(user, res); 
            
            return  res.status(201).json({ 
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                city: user.city,
                isAdmin: user.isAdmin,
                isSeller: user.isSeller,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                adhaar: user.adhaar
             });
        }else {
            return res.status(400).json({ err: "Invalid user data" });
        }
       
    } catch (error) {
        res.status(500).json({ message: `error in the singup controller ${error.message}` });
        if (!res.headersSent) {
            return res.status(500).json({ err: `Internal server error: ${error}` });
        } else {
            console.error('Response headers already sent', error);
        }
    }
}


export const loginController = async (req, res) => {
    const { username, password } = req.body;
    try{
        const user = await User.findOne({ username : username });
        if(user){
            const isMatch = await bcrypt.compare(password, user.password);
            
            if(isMatch){
                await generateTokenAndSetCookie(user, res); // Generate token and set cookie
                return res.status(200).json({
                    _id: user._id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    city: user.city,
                    isSeller: user.isSeller,
                    isAdmin: user.isAdmin,
                    isBlocked: user.isBlocked,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                });
            }else{
                return res.status(401).json({ err: "Invalid password" });
            }
        }else{
            return res.status(401).json({ err: "Invalid username " });
        }

    }catch(err){
        res.status(500).json({ message: `error in the login controller ${err.message}` });
        if (!res.headersSent) {
            return res.status(500).json({ err: `Internal server error: ${err}` });
        } else {
            console.error('Response headers already sent', err);
        }
    }
}

export const meController = async (req, res) => {
    try{
        const userId = req.user;
        const user = await User.findById(userId);
        if(user){
            return res.status(200).json({
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                city: user.city,
                isSeller: user.isSeller,
                isAdmin: user.isAdmin,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            });
        }else{
            return res.status(404).json({ err: "User not found" });
        }

    }catch(err){
        res.status(500).json({ message: `error in the me controller ${err.message}` });
    }
}

export const logoutController = async (req, res) => {
    try{
        res.clearCookie('jwt');
        res.status(200).json({ message: "Logged out successfully" });
    }catch(err){
        res.status(500).json({ message: `error in the logout controller ${err.message}` });
    }
}
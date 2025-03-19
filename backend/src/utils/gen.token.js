import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateTokenAndSetCookie = async(user, res) => {
  // Generate token
  const token =  jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
  );

  // Set cookie
  res.cookie("jwt", token, {
     maxAge: 24*60*60*1000, // 24 hours 
     httpOnly: true,
  });

  
};



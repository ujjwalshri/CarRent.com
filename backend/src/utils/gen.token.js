import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateTokenAndSetCookie = async(user, res) => {
  // Generate token
  const token =  jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET, 
    {  expiresIn: '15d' } 
  );

  // Set cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "none", 
});

};



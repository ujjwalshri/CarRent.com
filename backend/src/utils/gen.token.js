import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateTokenAndSetCookie = async(user, res) => {
  const token =  jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET, 
    {  expiresIn: '15d' } 
  );

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "None", 
    secure: true, 
    path: "/",
});

};



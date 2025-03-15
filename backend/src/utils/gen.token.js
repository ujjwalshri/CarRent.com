import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateTokenAndSetCookie = async(user, res) => {
  const token =  jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role, isSeller: user.isSeller }, // Payload
    process.env.JWT_SECRET, // Secret key
    { expiresIn: process.env.JWT_EXPIRES_IN } // Expiry time
  );

  res.cookie("jwt", token, {
    httpOnly: true, //An XSS (Cross-Site Scripting) attack is a type of security vulnerability typically found in web applications. 
    //It allows attackers to inject malicious scripts into web pages viewed by other users. 
    //These scripts can then execute in the context of the user's browser, potentially leading to various malicious activities
    secure: process.env.NODE_ENV !== "development", // Send only over HTTPS in production
    sameSite: "Strict", // Prevents CSRF attacks A cross-site request forgery (CSRF)
    // attack tricks a user into performing actions on a website they are authenticated to. 
    //This can lead to unauthorized fund transfers, password changes, and data theft. 
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};



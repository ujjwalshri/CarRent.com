import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});
export const  generateAndSendMail = async(mainData) => {
    console.log(mainData);
    console.log(process.env.EMAIL);
    console.log(process.env.PASSWORD);

    

    console.log("idhar tak aya");

    const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: mainData.subject,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50;">${mainData.subject}</h2>
                <p>${mainData.text}</p>
                <hr style="border: none; border-top: 1px solid #ddd;">
                <footer style="font-size: 0.9em; color: #777;">
                    <p>Thank you for using our service!</p>
                    <p><strong>Car Rental Service</strong></p>
                </footer>
            </div>
        `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

export const  generateWelcomeMail = async (user)=> {
        const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Welcome to our service',
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #4CAF50, #2E8B57); text-align: center; padding: 30px 20px;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Car Rental.com!</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Your journey begins here</p>
                </div>
                
                <!-- Content -->
                <div style="background-color: #ffffff; padding: 30px 25px;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <img src="https://cdn-icons-png.flaticon.com/512/3097/3097144.png" alt="Car Rental Icon" style="width: 80px; height: auto;">
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 15px;">Hello ${user.firstName || 'there'},</p>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">We're thrilled to welcome you to Car Rental.com! Thank you for choosing us for your car rental needs.</p>
                    
                    <div style="background-color: #f9f9f9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #444; font-size: 16px;">Your account has been successfully created and is ready to use!</p>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #333;">With your new account, you can:</p>
                    
                    <ul style="padding-left: 20px; margin: 15px 0 25px;">
                        <li style="margin-bottom: 8px; color: #444;">Browse our premium selection of vehicles</li>
                        <li style="margin-bottom: 8px; color: #444;">Make reservations in just a few clicks</li>
                        <li style="margin-bottom: 8px; color: #444;">Track your rental history</li>
                        <li style="margin-bottom: 8px; color: #444;">Access exclusive member discounts</li>
                    </ul>
                    
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;">If you have any questions, feel free to contact our support team:</p>
                    <p style="margin: 0 0 15px; color: #666; font-size: 14px;">
                    </p>
                    
                    
                    <p style="color: #999; font-size: 12px; margin: 20px 0 0;">© 2023 Car Rental.com. All rights reserved.</p>
                </div>
            </div>
        `,
    };  

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    }); 
}

export const  generateCongratulationMail = async (email, amount, startDate, endDate)=> {
  
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Congratulations Seller',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50;">Congratulation for becomming one of the top sellers on the carRental.com</h2>
                <h2>You have earned ${amount} in dates ${startDate} to ${endDate}</h2>
                <h2>Keep up the good work and continue to be one of the top sellers on the carRental.com</h2>
                <h2>Thank you for using our service</h2>
            </div>
        `,  
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

export const generateCongratulationMailToBuyer = async (email, totalBookings, startDate, endDate)=> {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Thank you for being one of the top renters',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50;">Thank you for being one of the top buyers on the carRental.com</h2>
                <h2>You have made ${totalBookings} bookings in ${startDate} to ${endDate}</h2>
                <h2>Keep up the good work and continue to be one of the top buyers on the carRental.com</h2>
                <h2>Thank you for using our service</h2>
            </div>
        `,
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
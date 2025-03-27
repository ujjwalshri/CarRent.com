import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

export default async function generateAndSendMail(mainData) {
    console.log(mainData);
    console.log(process.env.EMAIL);
    console.log(process.env.PASSWORD);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

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



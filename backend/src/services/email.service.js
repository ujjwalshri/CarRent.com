import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import {
    genericTemplate,
    welcomeTemplate,
    topSellerTemplate,
    topBuyerTemplate,
    congratulateBecomingSeller, 
    invoiceTemplate,
    carRejectionMailTemplate,
    verificationTemplate,
    vehicleApprovalTemplate
} from '../utils/email.templates.js';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

const sendEmail = async (options) => {
    const templates = {
        generic: genericTemplate,
        welcome: welcomeTemplate,
        topSeller: topSellerTemplate,
        topBuyer: topBuyerTemplate,
        congratulateBecomingSeller: congratulateBecomingSeller,
        invoice: invoiceTemplate,
        carRejection: carRejectionMailTemplate,
        verification: verificationTemplate,
        vehicleApproval: vehicleApprovalTemplate
    };

    const template = templates[options.template];
    if (!template) {
        throw new Error(`Template '${options.template}' not found`);
    }

    const mailOptions = {
        from: process.env.EMAIL,
        to: options.to,
        subject: options.subject,
        html: template(options.data)
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export const sendGenericEmail = async (data) => {
    return sendEmail({
        to: data.to,
        subject: data.subject,
        template: 'generic',
        data: {
            subject: data.subject,
            text: data.text
        }
    });
};

export const sendWelcomeEmail = async (user) => {
    return sendEmail({
        to: user.email,
        subject: 'Welcome to Car Rental.com',
        template: 'welcome',
        data: {
            firstName: user.firstName
        }
    });
};

export const sendTopSellerEmail = async (data) => {
    return sendEmail({
        to: data.email,
        subject: 'Congratulations - Top Seller Achievement',
        template: 'topSeller',
        data: {
            amount: data.amount,
            startDate: data.startDate,
            endDate: data.endDate
        }
    });
};

export const sendCongratulationEmail = async (data) => {

    return sendEmail({
        to: data.email,
        subject: 'Congratulations - for becoming a seller',
        template: 'congratulateBecomingSeller',
        data: data
    });
};

export const sendTopBuyerEmail = async (data) => {
    return sendEmail({
        to: data.email,
        subject: 'Thank You - Top Renter Achievement',
        template: 'topBuyer',
        data: {
            totalBookings: data.totalBookings,
            startDate: data.startDate,
            endDate: data.endDate
        }
    });
}; 

export const sendInvoiceEmail = async (data) => {
    return sendEmail({
        to: data.email,
        subject: 'Invoice for your carRental.com booking',
        template: 'invoice',
        data: data
    });
}

export const sendCarRejectionEmail = async (data) => {
    return sendEmail({
        to: data.email,
        subject: 'Car Rejection Notification',
        template: 'carRejection',
        data: data
    });
}

export const sendVerificationEmail = async (data) => {
    return sendEmail({
        to: data.email,
        subject: 'Verify Your Email - Car Rental',
        template: 'verification',
        data: {
            firstName: data.firstName,
            verificationToken: data.verificationToken
        }
    });
};

export const sendVehicleApprovalEmail = async (data) => {
    return sendEmail({
        to: data.owner.email,
        subject: 'Vehicle Approved - Car Rental',
        template: 'vehicleApproval',
        data: {
            ownerName: `${data.owner.firstName} ${data.owner.lastName}`,
            company: data.company,
            name: data.name,
            modelYear: data.modelYear,
            registrationNumber: data.registrationNumber,
            city: data.city,
            price: data.price
        }
    });
};
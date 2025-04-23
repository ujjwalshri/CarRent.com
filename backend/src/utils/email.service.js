/**
 * Email Service
 * @module utils/email.service
 */
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
    verificationTemplate
} from './email.templates.js';

dotenv.config();

/**
 * Nodemailer transporter object configured with Gmail service
 * @constant {Object} transporter
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

/**
 * Send an email using the provided template and data
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name to use
 * @param {Object} options.data - Data to be used in the template
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
    const templates = {
        generic: genericTemplate,
        welcome: welcomeTemplate,
        topSeller: topSellerTemplate,
        topBuyer: topBuyerTemplate,
        congratulateBecomingSeller: congratulateBecomingSeller,
        invoice: invoiceTemplate,
        carRejection: carRejectionMailTemplate,
        verification: verificationTemplate
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

/**
 * Send a generic email
 * @param {Object} data - Email data
 * @param {string} data.to - Recipient email
 * @param {string} data.subject - Email subject
 * @param {string} data.text - Email content
 * @returns {Promise<void>}
 */
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

/**
 * Send a welcome email to a new user
 * @param {Object} user - User data
 * @param {string} user.email - User's email address
 * @param {string} user.firstName - User's first name
 * @returns {Promise<void>}
 */
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

/**
 * Send a congratulation email to top sellers
 * @param {Object} data - Seller data
 * @param {string} data.email - Seller's email
 * @param {number} data.amount - Earnings amount
 * @param {string} data.startDate - Start date
 * @param {string} data.endDate - End date
 * @returns {Promise<void>}
 */
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

/**
 * Send a congratulation email to a seller who has become a seller
 * @param {Object} data - Seller data
 * @param {string} data.email - Seller's email
 * @param {string} data.company - Company name
 * @param {string} data.name - Car name
 * @param {string} data.modelYear - Car model year
 * @returns {Promise<void>}
 */
export const sendCongratulationEmail = async (data) => {
    console.log(data);
    return sendEmail({
        to: data.email,
        subject: 'Congratulations - Top Seller Achievement',
        template: 'congratulateBecomingSeller',
        data: data
    });
};
/**
 * Send a thank you email to top buyers
 * @param {Object} data - Buyer data
 * @param {string} data.email - Buyer's email
 * @param {number} data.totalBookings - Total number of bookings
 * @param {string} data.startDate - Start date
 * @param {string} data.endDate - End date
 * @returns {Promise<void>}
 */
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
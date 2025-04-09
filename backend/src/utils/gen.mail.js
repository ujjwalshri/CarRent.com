/**
 * Email Generation and Sending Utility
 * @module utils/gen.mail
 */
import {
    sendGenericEmail,
    sendWelcomeEmail,
    sendTopSellerEmail,
    sendTopBuyerEmail,
    sendCongratulationEmail, 
    sendInvoiceEmail,
    sendCarRejectionEmail
} from './email.service.js';

/**
 * Generates and sends a generic email using provided data
 * @param {Object} mainData - Email content and metadata
 * @returns {Promise<void>}
 */
export const generateAndSendMail = async(mainData) => {
    return sendGenericEmail({
        to: mainData.to,
        subject: mainData.subject,
        text: mainData.text
    });
};

/**
 * Generates and sends a welcome email to a new user
 * @param {Object} user - User object containing recipient information
 * @returns {Promise<void>}
 */
export const generateWelcomeMail = async (user) => {
    return sendWelcomeEmail(user);
};

/**
 * Generates and sends a congratulation email to top sellers
 * @param {string} email - Email address of the recipient seller
 * @param {number} amount - Earnings amount for the specified period
 * @param {string} startDate - Start date of the earning period
 * @param {string} endDate - End date of the earning period
 * @returns {Promise<void>}
 */
export const generateCongratulationMail = async (email, amount, startDate, endDate) => {
    return sendTopSellerEmail({
        email,
        amount,
        startDate,
        endDate
    });
};


export const generateCongratulationMailToSeller = async (email, company, name, modelYear) => {
    return sendCongratulationEmail({
        email,
        company,
        name,
        modelYear
    });
};
/**
 * Generates and sends a thank you email to top renters/buyers
 * @param {string} email - Email address of the recipient buyer
 * @param {number} totalBookings - Number of bookings made in the specified period
 * @param {string} startDate - Start date of the booking period
 * @param {string} endDate - End date of the booking period
 * @returns {Promise<void>}
 */
export const generateCongratulationMailToBuyer = async (email, totalBookings, startDate, endDate) => {
    return sendTopBuyerEmail({
        email,
        totalBookings,
        startDate,
        endDate
    });
};

export const generateInvoiceMail = async (email, booking) => {
    return sendInvoiceEmail({
        email,
        booking
    });
};

export const generateCarRejectionMail = async (data) => {
    return sendCarRejectionEmail({
        email: data.email,
        seller: data.seller,
        vehicle: data.vehicle
    });
};

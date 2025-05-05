import Charges from '../models/charges.model.js';

/**
 * Email Templates
 * @module utils/email.templates
 */

/**
 * Generic email template
 * @param {Object} data - Template data
 * @returns {string} HTML template
 */
export const genericTemplate = (data) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">${data.subject}</h2>
        <p>${data.text}</p>
        <hr style="border: none; border-top: 1px solid #ddd;">
        <footer style="font-size: 0.9em; color: #777;">
            <p>Thank you for using our service!</p>
            <p><strong>Car Rental Service</strong></p>
        </footer>
    </div>
`;

/**
 * Welcome email template
 * @param {Object} data - Template data
 * @returns {string} HTML template
 */
export const welcomeTemplate = (data) => `
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
            
            <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 15px;">Hello ${data.firstName || 'there'},</p>
            
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
            <p style="margin: 0 0 10px; color: #666; font-size: 14px;">If you have any questions, feel free to contact our support team</p>
            <p style="color: #999; font-size: 12px; margin: 20px 0 0;">© ${new Date().getFullYear()} Car Rental.com. All rights reserved.</p>
        </div>
    </div>
`;

/**
 * Top seller congratulation template
 * @param {Object} data - Template data
 * @returns {string} HTML template
 */
export const topSellerTemplate = (data) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">Congratulations for becoming one of the top sellers on Car Rental.com!</h2>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; margin: 10px 0;">You have earned ₹${data.amount} between ${data.startDate} and ${data.endDate}</p>
        </div>
        <p style="font-size: 16px;">Keep up the excellent work and continue to be one of our top sellers!</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <footer style="font-size: 0.9em; color: #777;">
            <p>Thank you for being a valued partner!</p>
            <p><strong>Car Rental Service</strong></p>
        </footer>
    </div>
`;

/**
 * Top buyer congratulation template
 * @param {Object} data - Template data
 * @returns {string} HTML template
 */
export const topBuyerTemplate = (data) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">Thank you for being one of our top renters!</h2>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; margin: 10px 0;">You have made ${data.totalBookings} bookings between ${data.startDate} and ${data.endDate}</p>
        </div>
        <p style="font-size: 16px;">We appreciate your loyalty and continued trust in our service!</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <footer style="font-size: 0.9em; color: #777;">
            <p>Thank you for choosing our service!</p>
            <p><strong>Car Rental Service</strong></p>
        </footer>
    </div>
`; 

export const congratulateBecomingSeller = (data) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">Congratulations for becoming a seller on Car Rental.com </h2>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; margin: 10px 0;">Your car ${data.company} ${data.name} ${data.modelYear} has been approved and is now available for rent on our platform</p>
            <p style="font-size: 16px; margin: 10px 0;">You can now start renting out your car to our customers and make sure to check our seller dashboard for detailed analytics and insights</p>
        </div>
    </div>
`;

/**
 * Invoice template
 * @param {Object} data - Template data containing booking, car, and owner details
 * @returns {string} HTML template
 */
export const invoiceTemplate = (data) => {
    console.log("data ke charges" + data.charges);
    // Calculate number of days (including both start and end dates)
    const startDate = new Date(data.booking.startDate);
    const endDate = new Date(data.booking.endDate);
    const numberOfDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate base price (rental amount)
    const basePrice = numberOfDays * data.booking.amount;
    
    // Calculate distance fine if applicable
    const distanceTraveled = data.booking.endOdometerValue - data.booking.startOdometerValue;
    const extraDistance = Math.max(0, distanceTraveled - 300);
    const distanceFine = extraDistance * 10;
    const addonsTotal = data.booking.selectedAddons.reduce((acc, addon) => acc + addon.price, 0);

    // Calculate taxes if available - NOW ONLY APPLIED TO BASE PRICE (not addons or fines)
    let taxesTotal = 0;
    let taxDetails = [];
    
    if (data.taxes && Array.isArray(data.taxes)) {
        // Only apply active taxes
        const activeTaxes = data.taxes.filter(tax => tax.isActive);
        
        // Calculate each tax and add to total - ONLY ON BASE PRICE
        activeTaxes.forEach(tax => {
            let taxAmount = 0;
            
            if (tax.type === 'percentage') {
                taxAmount = (basePrice * tax.value) / 100;
            } else { // fixed tax
                taxAmount = tax.value;
            }
            
            // Round to 2 decimal places
            taxAmount = Math.round(taxAmount * 100) / 100;
            taxesTotal += taxAmount;
            
            // Store tax details for display
            taxDetails.push({
                name: tax.name,
                value: tax.type === 'percentage' ? `${tax.value}%` : `₹${tax.value.toFixed(2)}`,
                amount: taxAmount
            });
        });
    }
    
    // Calculate platform fee (based on everything: base price + addons + fines)
    const subtotal = basePrice + distanceFine + addonsTotal;
    const platformFeePercentage = data.charges.percentage===undefined ? 2: data.charges.percentage; 
    const platformFee = ((subtotal-distanceFine) * platformFeePercentage) / 100;

    // Calculate grand total including taxes
    const totalPrice = subtotal + platformFee + taxesTotal;

    return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h1 style="margin: 0; font-size: 28px; text-transform: uppercase;">Rental Invoice</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Booking Reference: ${data.booking._id}</p>
            <p style="margin: 5px 0 0; font-size: 14px;">Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                <div>
                    <h3 style="color: #4CAF50; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">
                        <span style="display: inline-block; width: 20px; text-align: center;">📅</span> Rental Period
                    </h3>
                    <p style="margin: 8px 0;"><strong>Start Date:</strong> ${new Date(data.booking.startDate).toLocaleDateString()}</p>
                    <p style="margin: 8px 0;"><strong>End Date:</strong> ${new Date(data.booking.endDate).toLocaleDateString()}</p>
                    <p style="margin: 8px 0;"><strong>Duration:</strong> ${numberOfDays} days</p>
                    <p style="margin: 8px 0;"><strong>Daily Rate:</strong> ₹${data.booking.amount}</p>
                </div>
                <div>
                    <h3 style="color: #4CAF50; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">
                        <span style="display: inline-block; width: 20px; text-align: center;">🚗</span> Distance Details
                    </h3>
                    <p style="margin: 8px 0;"><strong>Start Reading:</strong> ${data.booking.startOdometerValue} km</p>
                    <p style="margin: 8px 0;"><strong>End Reading:</strong> ${data.booking.endOdometerValue} km</p>
                    <p style="margin: 8px 0;"><strong>Distance Traveled:</strong> ${distanceTraveled} km</p>
                    <p style="margin: 8px 0;"><strong>Free Distance:</strong> 300 km</p>
                </div>
            </div>

            <div style="margin-bottom: 30px;">
                <h3 style="color: #4CAF50; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">
                    <span style="display: inline-block; width: 20px; text-align: center;">🚙</span> Vehicle Details
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <p style="margin: 8px 0;"><strong>Car:</strong> ${data.booking.vehicle.company} ${data.booking.vehicle.name}</p>
                        <p style="margin: 8px 0;"><strong>Model Year:</strong> ${data.booking.vehicle.modelYear}</p>
                        <p style="margin: 8px 0;"><strong>Color:</strong> ${data.booking.vehicle.color}</p>
                    </div>
                    <div>
                        <p style="margin: 8px 0;"><strong>Category:</strong> ${data.booking.vehicle.category}</p>
                        <p style="margin: 8px 0;"><strong>Fuel Type:</strong> ${data.booking.vehicle.fuelType}</p>
                        <p style="margin: 8px 0;"><strong>City:</strong> ${data.booking.vehicle.city}</p>
                    </div>
                </div>
            </div>

            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-top: 20px;">
                <h3 style="color: #4CAF50; margin-bottom: 20px; font-size: 18px; text-align: center;">Price Breakdown</h3>
                
                <!-- Base price section -->
                <div style="border-bottom: 1px solid #dee2e6; padding-bottom: 10px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Base Price (${numberOfDays} days × ₹${data.booking.amount})</span>
                        <span>₹ ${basePrice.toFixed(2)}</span>
                    </div>
                    ${distanceFine > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #dc3545;">
                        <span>Distance Fine (${extraDistance} km × ₹10)</span>
                        <span>₹ ${distanceFine.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    ${data.booking.selectedAddons.length > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Addons (${data.booking.selectedAddons.map(addon => addon.name).join(', ')})</span>
                        <span>₹ ${addonsTotal.toFixed(2)}</span>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Subtotal section -->
                <div style="border-bottom: 1px solid #dee2e6; padding-bottom: 10px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span><strong>Subtotal</strong></span>
                        <span><strong>₹ ${subtotal.toFixed(2)}</strong></span>
                    </div>
                </div>
                
                <!-- Fees and taxes section -->
                <div style="border-bottom: 1px solid #dee2e6; padding-bottom: 10px; margin-bottom: 10px;">
                    <!-- Platform fee -->
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #666;">
                        <span>Platform Fee (${platformFeePercentage}%)</span>
                        <span>₹ ${platformFee.toFixed(2)}</span>
                    </div>
                    
                    <!-- Taxes section with prominent styling - now notes that it's only on base rental amount -->
                    ${taxDetails.length > 0 ? `
                    <div style="background-color: #e8f5e9; padding: 10px; border-radius: 5px; margin: 10px 0;">
                        <div style="font-weight: bold; margin-bottom: 5px; color: #2e7d32;">Taxes (applied on base rental amount only):</div>
                        ${taxDetails.map(tax => `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #33691e;">
                            <span>${tax.name} (${tax.value})</span>
                            <span>₹ ${tax.amount.toFixed(2)}</span>
                        </div>
                        `).join('')}
                        <div style="display: flex; justify-content: space-between; margin-top: 5px; font-weight: bold; color: #33691e;">
                            <span>Total Taxes</span>
                            <span>₹ ${taxesTotal.toFixed(2)}</span>
                        </div>
                    </div>
                    ` : `
                    <div style="text-align: center; padding: 10px; color: #666; font-style: italic;">
                        No taxes applicable
                    </div>
                    `}
                </div>
                
                <!-- Grand total with prominent styling -->
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: white; background-color: #4CAF50; padding: 12px 15px; border-radius: 5px;">
                    <span>Total Amount</span>
                    <span>₹ ${totalPrice.toFixed(2)}</span>
                </div>
            </div>

            <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; font-size: 14px;">
                <h4 style="color: #4CAF50; margin-bottom: 10px;">Important Notes:</h4>
                <ul style="list-style-type: none; padding-left: 0; margin: 0;">
                    <li style="margin-bottom: 5px;">• A platform fee of ${platformFeePercentage}% is applied to all bookings</li>
                    <li style="margin-bottom: 5px;">• Taxes are applied only to the base rental amount</li>
                    <li style="margin-bottom: 5px;">• Distance charges of ₹10/km apply beyond 300 kilometers</li>
                    <li style="margin-bottom: 5px;">• All taxes applicable as per government regulations</li>
                    <li style="margin-bottom: 5px;">• All prices are in Indian Rupees (₹)</li>
                    <li style="margin-bottom: 5px;">• Taxes and fees are non-refundable</li>
                </ul>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                <p style="color: #666; margin-bottom: 5px;">Thank you for choosing our service!</p>
                <p style="color: #666; font-size: 12px;">For support, contact us at support@carrental.com</p>
            </div>
        </div>
    </div>
    `;
};

export const carRejectionMailTemplate = (data) => {
    // Safely access properties with fallbacks
    const sellerFirstName = data.seller?.firstName || 'Seller';
    const sellerLastName = data.seller?.lastName || '';
    const vehicleCompany = data.vehicle?.company || '';
    const vehicleName = data.vehicle?.name || '';
    const vehicleModelYear = data.vehicle?.modelYear || '';
    
    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">Car Rejection Notification</h2>
        <p>Dear ${sellerFirstName} ${sellerLastName},</p>
        <p>We regret to inform you that your car ${vehicleCompany} ${vehicleName} ${vehicleModelYear} has been rejected for one of the following reasons:</p>
        <ul>
            <li>The car images are not real</li>
            <li>The car registration number is not valid</li>
            <li>The car details are not correct</li>
            <li>We dont allow cars from your country</li>
            <li>The owner details are not correct</li>
            
        </ul>
        <p>Please review the feedback and make the necessary changes to your car listing.</p>
        <p>Thank you for your understanding.</p>
    </div>
    `
}

export const verificationTemplate = (data) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Verify Your Email Address</h2>
            <p>Hello ${data.firstName},</p>
            <p>Thank you for signing up with Car Rental! To complete your registration, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:8000/api/auth/verify/${data.verificationToken}" 
                   style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                    Verify Email
                </a>
            </div>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you did not create an account with Car Rental, please ignore this email.</p>
            <p>Best regards,<br>The Car Rental Team</p>
        </div>
    `;
};

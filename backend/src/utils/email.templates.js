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
            <p style="font-size: 16px; margin: 10px 0;">You have earned $${data.amount} between ${data.startDate} and ${data.endDate}</p>
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
    // Calculate number of days (including both start and end dates)
    const startDate = new Date(data.booking.startDate);
    const endDate = new Date(data.booking.endDate);
    const numberOfDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate base price
    const basePrice = numberOfDays * data.booking.amount;
    
    // Calculate distance fine if applicable
    const distanceTraveled = data.booking.endOdometerValue - data.booking.startOdometerValue;
    const extraDistance = Math.max(0, distanceTraveled - 300);
    const distanceFine = extraDistance * 10;
    
    // Calculate total price
    const totalPrice = basePrice + distanceFine;

    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto;">
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">CarRental.com Invoice</h1>
            <p style="margin: 10px 0 0;">Booking Reference: ${data.booking._id}</p>
        </div>

        <div style="padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                <div>
                    <h3 style="color: #4CAF50; margin-bottom: 10px;">Rental Details</h3>
                    <p><strong>Start Date:</strong> ${new Date(data.booking.startDate).toLocaleDateString()}</p>
                    <p><strong>End Date:</strong> ${new Date(data.booking.endDate).toLocaleDateString()}</p>
                    <p><strong>Number of Days:</strong> ${numberOfDays}</p>
                    <p><strong>Daily Rate:</strong> ₹${data.booking.amount}</p>
                </div>
                <div>
                    <h3 style="color: #4CAF50; margin-bottom: 10px;">Distance Details</h3>
                    <p><strong>Start Odometer:</strong> ${data.booking.startOdometerValue} km</p>
                    <p><strong>End Odometer:</strong> ${data.booking.endOdometerValue} km</p>
                    <p><strong>Distance Traveled:</strong> ${distanceTraveled} km</p>
                    <p><strong>Free Distance:</strong> 300 km</p>
                </div>
            </div>

            <div style="margin-bottom: 30px;">
                <h3 style="color: #4CAF50; margin-bottom: 10px;">Vehicle Details</h3>
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <p><strong>Car Name:</strong> ${data.booking.vehicle.name}</p>
                        <p><strong>Company:</strong> ${data.booking.vehicle.company}</p>
                        <p><strong>Model Year:</strong> ${data.booking.vehicle.modelYear}</p>
                        <p><strong>Color:</strong> ${data.booking.vehicle.color}</p>
                    </div>
                    <div>
                        <p><strong>Fuel Type:</strong> ${data.booking.vehicle.fuelType}</p>
                        <p><strong>Category:</strong> ${data.booking.vehicle.category}</p>
                        <p><strong>City:</strong> ${data.booking.vehicle.city}</p>
                        <p><strong>Mileage:</strong> ${data.booking.vehicle.mileage} km/l</p>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 30px;">
                <h3 style="color: #4CAF50; margin-bottom: 10px;">Owner Details</h3>
                <p><strong>Name:</strong> ${data.booking.owner.firstName} ${data.booking.owner.lastName}</p>
                <p><strong>City:</strong> ${data.booking.owner.city}</p>
            </div>

            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3 style="color: #4CAF50; margin-bottom: 15px;">Price Breakdown</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Base Price (${numberOfDays} days × ₹${data.booking.amount})</span>
                    <span>₹${basePrice}</span>
                </div>
                ${distanceFine > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #f44336;">
                    <span>Distance Fine (${extraDistance} km × ₹10)</span>
                    <span>₹${distanceFine}</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd; font-weight: bold;">
                    <span>Total Amount</span>
                    <span>₹${totalPrice}</span>
                </div>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
                <p><strong>Note:</strong> A distance fine of ₹10 per kilometer is applied for travel exceeding 300 kilometers.</p>
                <p>For any queries regarding this invoice, please contact our support team.</p>
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
            <li>The car details are not correct</li>
            <li>We dont allow cars from your country</li>
            <li>The owner details are not correct</li>
        </ul>
        <p>Please review the feedback and make the necessary changes to your car listing.</p>
        <p>Thank you for your understanding.</p>
    </div>
    `
}

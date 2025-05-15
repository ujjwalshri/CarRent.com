import { parentPort } from 'worker_threads';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import Bidding from '../models/bidding.model.js';
import { sendGenericEmail } from '../services/email.service.js';
import connectMongoDB from '../config/db.connection.js';

dotenv.config();

// Initialize AWS SQS
const sqs = new AWS.SQS({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_BUCKET_REGION
});

const queueUrl = process.env.QUEUE_LINK;

/**
 * Process a single bid message
 */
async function processBidMessage(message) {
    try {
        const bidData = JSON.parse(message.Body);

        // Saving the bid to database
        const newBid = new Bidding(bidData);
        const savedBid = await newBid.save();
        
        // Send notification data back to main thread to emit socket event
        parentPort.postMessage({
            type: 'bidSuccess',
            data: {
                username: bidData.from.username,
                bidData: {
                    bidId: savedBid._id,
                    carName: bidData.vehicle.name,
                    amount: bidData.amount,
                    startDate: bidData.startDate,
                    endDate: bidData.endDate
                }
            }
        });

        // Send confirmation email to bidder
        sendGenericEmail({
            to: bidData.from.email,
            subject: "Bidding Sent Successfully",
            text: `Congratulations! You have successfully placed a bid on ${bidData.vehicle.company} ${bidData.vehicle.name}.

Details:
- Vehicle: ${bidData.vehicle.company} ${bidData.vehicle.name} (${bidData.vehicle.modelYear})
- Owner: ${bidData.owner.firstName} ${bidData.owner.lastName} (${bidData.owner.username})
- Bid amount: ₹${bidData.amount} per day
- Rental period: ${new Date(bidData.startDate).toLocaleDateString()} to ${new Date(bidData.endDate).toLocaleDateString()}
- Selected addons: ${bidData.selectedAddons.length > 0 ? bidData.selectedAddons.map(addon => addon.name).join(', ') : 'No addons selected'}

Your booking request has been sent to the vehicle owner. You will receive a notification when the owner approves or rejects your request.

Thank you for using Car Rental.com!`
        }).catch((err) => {
            console.error(`Error sending bidder email: ${err.message}`);
        });

        // Send notification email to vehicle owner
        sendGenericEmail({
            to: bidData.owner.email,
            subject: "New Booking Request Received",
            text: `Hello ${bidData.owner.firstName},

You have received a new booking request for your vehicle ${bidData.vehicle.company} ${bidData.vehicle.name}.

Booking details:
- Requested by: ${bidData.from.firstName} ${bidData.from.lastName} (${bidData.from.username})
- Bid amount: ₹${bidData.amount} per day
- Rental period: ${new Date(bidData.startDate).toLocaleDateString()} to ${new Date(bidData.endDate).toLocaleDateString()}
- Selected addons: ${bidData.selectedAddons.length > 0 ? bidData.selectedAddons.map(addon => addon.name).join(', ') : 'No addons selected'}

Please log in to your account to approve or reject this booking request.

Thank you for being a part of Car Rental.com!`
        }).catch((err) => {
            console.error(`Error sending owner email: ${err.message}`);
        });

        // Delete the processed message
        await sqs.deleteMessage({
            QueueUrl: queueUrl,
            ReceiptHandle: message.ReceiptHandle
        }).promise();

        parentPort.postMessage({ status: 'success', messageId: message.MessageId });
    } catch (error) {
        console.error('Error processing bid message:', error);
        parentPort.postMessage({ status: 'error', error: error.message, messageId: message.MessageId });
    }
}

/**
 * Start processing messages from the queue
 */
async function startProcessing() {
    try {
        await connectMongoDB();

        setInterval(async () => {
            try {
                const { Messages } = await sqs.receiveMessage({
                    QueueUrl: queueUrl,
                    MaxNumberOfMessages: 10,
                    WaitTimeSeconds: 0, 
                    VisibilityTimeout: 60
                }).promise();

                if (!Messages || Messages.length === 0) {
                    console.log('No messages to process.');
                    return;
                }

                console.log(`Processing ${Messages.length} messages`);

                for (const message of Messages) {
                    await processBidMessage(message);
                }

            } catch (error) {
                console.error('Error during message polling:', error);
            }
        }, 5000);

    } catch (error) {
        console.error('Fatal error in worker startup:', error);
        process.exit(1);
    }
}

// Start processing when the worker is initialized
startProcessing();
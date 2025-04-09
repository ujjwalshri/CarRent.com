import { parentPort } from 'worker_threads';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import Bidding from '../models/bidding.model.js';
import { generateAndSendMail } from '../utils/gen.mail.js';
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

        if (!bidData.vehicle || !bidData.from || !bidData.owner || !bidData.amount) {
            throw new Error('Invalid bid data structure');
        }

        // Save the bid to database
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

        // Send confirmation emails
        generateAndSendMail({
            subject: "Bidding Sent",
            text: `Congrats You have successfully placed a bid on vehicle ${bidData.vehicle.name} the owner of the vehicle is ${bidData.owner.username}, the bid amount is $ ${bidData.amount}, startDate is ${new Date(bidData.startDate).toLocaleDateString()}, endDate is ${new Date(bidData.endDate).toLocaleDateString()}`,
            to: bidData.from.email
        }).catch((err) => {
            console.error(`Error sending bidding email: ${err.message}`);
        });

        generateAndSendMail({
            subject: "Bidding Sent",
            text: `Congrats bid placed on your vehicle ${bidData.vehicle.name} the bid amount is $ ${bidData.amount}, startDate is ${new Date(bidData.startDate).toLocaleDateString()}, endDate is ${new Date(bidData.endDate).toLocaleDateString()} placed by ${bidData.from.username}`,
            to: bidData.owner.email
        }).catch((err) => {
            console.error(`Error sending bidding email: ${err.message}`);
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
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
        console.log('Processing bid data:', bidData);

        if (!bidData.vehicle || !bidData.from || !bidData.owner || !bidData.amount) {
            throw new Error('Invalid bid data structure');
        }

        // Save the bid to database
        const newBid = new Bidding(bidData);
        await newBid.save();

        // Send confirmation emails
        await generateAndSendMail({
            subject: "Bidding Sent",
            text: `Congrats You have successfully placed a bid on vehicle ${bidData.vehicle.name} the owner of the vehicle is ${bidData.owner.username}, the bid amount is ${bidData.amount}, startDate is ${new Date(bidData.startDate).toLocaleDateString()}, endDate is ${new Date(bidData.endDate).toLocaleDateString()}`,
            to: bidData.from.email
        });

        await generateAndSendMail({
            subject: "Bidding Sent",
            text: `Congrats bid placed on your vehicle ${bidData.vehicle.name} the bid amount is ${bidData.amount}, startDate is ${new Date(bidData.startDate).toLocaleDateString()}, endDate is ${new Date(bidData.endDate).toLocaleDateString()} placed by ${bidData.from.username}`,
            to: bidData.owner.email
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
        // Connect to MongoDB when the worker starts
        await connectMongoDB();
        
        while (true) {
            try {
                const { Messages } = await sqs.receiveMessage({
                    QueueUrl: queueUrl,
                    MaxNumberOfMessages: 10,
                    WaitTimeSeconds: 5,
                    VisibilityTimeout: 60
                }).promise();

                if (!Messages || Messages.length === 0) {
                    continue;
                }

                for (const message of Messages) {
                    await processBidMessage(message);
                }
            } catch (error) {
                console.error('Error in message processing loop:', error);
                // Continue the loop even if there's an error
            }
        }
    } catch (error) {
        console.error('Fatal error in worker:', error);
        process.exit(1);
    }
}

// Start processing when the worker is initialized
startProcessing(); 
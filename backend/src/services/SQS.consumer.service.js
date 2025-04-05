import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import Bidding from '../models/bidding.model.js';
import { generateAndSendMail } from '../utils/gen.mail.js';

dotenv.config();

class SQSConsumerService {
    constructor() {
        AWS.config.update({
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            region: process.env.S3_BUCKET_REGION
        });

        this.sqs = new AWS.SQS();
        this.queueUrl = process.env.QUEUE_LINK;
    }

    /**
     * Process a single bid message
     * @param {Object} message - The SQS message to process
     */
    async processBidMessage(message) {
        try {
            const bidData = JSON.parse(message.Body);
            console.log('Processing bid data:', bidData);

            if (!bidData.vehicle || !bidData.from || !bidData.owner || !bidData.amount) {
                console.error('Invalid bid data, missing required fields', bidData);
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
            await this.sqs.deleteMessage({
                QueueUrl: this.queueUrl,
                ReceiptHandle: message.ReceiptHandle
            }).promise();

            console.log('Successfully processed bid message');
        } catch (error) {
            console.error('Error processing bid message:', error);
            throw error;
        }
    }

    /**
     * Start processing messages from the queue
     */
    async startProcessing() {
        try {
            console.log('Checking SQS queue for new bids...');

            const params = {
                QueueUrl: this.queueUrl,
                MaxNumberOfMessages: 10,
                WaitTimeSeconds: 5,
                VisibilityTimeout: 60
            };

            const { Messages } = await this.sqs.receiveMessage(params).promise();

            if (!Messages || Messages.length === 0) {
                console.log('No new bids found in SQS queue');
                return;
            }

            for (const message of Messages) {
                try {
                    await this.processBidMessage(message);
                } catch (messageError) {
                    console.error('Error processing message:', messageError);
                }
            }
        } catch (error) {
            console.error('Error in processBids:', error);
            throw error;
        }
    }

    /**
     * Start the continuous processing loop
     */
    async startConsumer() {
        try {
            console.log("Starting SQS bid processing loop...");
            
            const processAndReschedule = async () => {
                try {
                    await this.startProcessing();
                } catch (error) {
                    console.error("Error processing bids:", error);
                }
                setTimeout(processAndReschedule, 5000);
            };

            processAndReschedule();
            console.log("SQS bid processing loop initiated successfully");
        } catch (err) {
            console.error("Failed to start SQS bid processing:", err);
            setTimeout(() => this.startConsumer(), 10000);
        }
    }
}

// Create and export a singleton instance
const sqsConsumerService = new SQSConsumerService();
export default sqsConsumerService; 
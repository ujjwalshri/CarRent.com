import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import Bidding from '../models/bidding.model.js';
import {generateAndSendMail} from '../utils/gen.mail.js';


dotenv.config();

AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_BUCKET_REGION
});

const sqs = new AWS.SQS();
const queueUrl = process.env.QUEUE_LINK;
console.log(queueUrl)

/* 
consumer function to process the bids from the SQS queue
*/
export const processBids = async () => {
    try {
        console.log('Checking SQS queue for new bids...');

        const params = { // parameters for receiving messages from the SQS queue
            QueueUrl: queueUrl,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 5,
            VisibilityTimeout: 60 
        };

        const { Messages } = await sqs.receiveMessage(params).promise();

        if (!Messages || Messages.length === 0) {
            console.log('No new bids found in SQS queue');
            return;
        }

        for (const message of Messages) {
            try {
                const bidData = JSON.parse(message.Body); // parse the message body
                console.log('Bid data extracted:', bidData);
               
                if (!bidData.vehicle || !bidData.from || !bidData.owner || !bidData.amount) {
                    console.error('Invalid bid data, missing required fields', bidData);
                    throw new Error('Invalid bid data structure');
                }

                const newBid = new Bidding(bidData);
                await newBid.save();

                 generateAndSendMail({ subject: "Bidding Sent", text: `Congrats You have successfully placed a bid on vehicle ${bidData.vehicle.name} the owner of the vehicle is ${bidData.owner.username}, the bid amount is ${bidData.amount}, startDate is ${new Date(bidData.startDate).toLocaleDateString()}, endDate is ${new Date(bidData.endDate).toLocaleDateString()}` });
                await sqs.deleteMessage({ // delete the message from the SQS queue
                    QueueUrl: queueUrl,
                    ReceiptHandle: message.ReceiptHandle
                }).promise();
            } catch (messageError) {
                console.error('Error processing message:', messageError);
                
            }
        }
    } catch (error) {
        console.error('Error in processBids:', error);
        throw error;
    }
};


export const startSQSBidProcessing = async() => {
     const res = await processBids()
     console.log(res)
}
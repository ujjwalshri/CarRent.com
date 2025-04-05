import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

class SQSProducerService {
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
     * Sends a bid message to the SQS queue
     * @param {Object} bidData - The bid data to be sent to the queue
     * @returns {Promise} - Returns a promise that resolves when the message is sent
     */
    async sendBidMessage(bidData) {
        try {
            const params = {
                QueueUrl: this.queueUrl,
                MessageBody: JSON.stringify(bidData),
                MessageAttributes: {
                    "MessageType": {
                        DataType: "String",
                        StringValue: "BID_PLACED"
                    }
                }
            };

            const result = await this.sqs.sendMessage(params).promise();
            console.log('Successfully sent message to SQS:', result.MessageId);
            return result;
        } catch (error) {
            console.error('Error sending message to SQS:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const sqsProducerService = new SQSProducerService();
export default sqsProducerService;

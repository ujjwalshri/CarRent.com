import { GoogleGenerativeAI } from '@google/generative-ai';
import Bidding from '../models/bidding.model.js';
import dotenv from 'dotenv';

dotenv.config();

class GeminiService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is not set');
        }
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro",
            generationConfig: {
                temperature: 0.9,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
            },
        });
    }

    /**
     * Initialize a chat conversation
     * @returns {ChatSession} A new chat session
     */
    async initializeChat() {
        try {
            return this.model.startChat({
                generationConfig: {
                    maxOutputTokens: 2048,
                },
            });
        } catch (error) {
            console.error('Chat initialization error:', error);
            throw new Error(`Failed to initialize chat: ${error.message}`);
        }
    }

    /**
     * Generate a response from text prompt
     * @param {string} prompt - The text prompt to send to Gemini
     * @returns {Promise<string>} The generated response
     */
    async generateResponse(prompt) {
        if (!prompt) {
            throw new Error('Prompt is required');
        }

        try {
            const result = await this.model.generateContent(prompt);
            if (!result || !result.response) {
                throw new Error('No response generated from the model');
            }
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Generate response error:', error);
            throw new Error(`Failed to generate response: ${error.message}`);
        }
    }

    /**
     * Generate a response with streaming
     * @param {string} prompt - The text prompt to send to Gemini
     * @returns {AsyncGenerator} A generator that yields response chunks
     */
    async *generateStreamResponse(prompt) {
        if (!prompt) {
            throw new Error('Prompt is required');
        }

        try {
            const result = await this.model.generateContentStream(prompt);
            for await (const chunk of result.stream) {
                yield chunk.text();
            }
        } catch (error) {
            console.error('Stream response error:', error);
            throw new Error(`Failed to generate stream response: ${error.message}`);
        }
    }

    async getOptimalBid(vehicleId) {
        if (!vehicleId) {
            throw new Error('Vehicle ID is required');
        }

        try {
            const bookingHistory = await Bidding.find({'vehicle._id': vehicleId, status: {$in: ["accepted","started", "ended", "reviewed"]}});
            const bookingHistoryText = bookingHistory.map((bid, index) => {
                return `BidId: ${bid._id}, Amount: $${bid.amount}, User: ${bid.from.username}, Duration: ${(new Date(bid.endDate) - new Date(bid.startDate)) / (1000 * 60 * 60 * 24)} days 
                name: ${bid.vehicle.name}
                Company: ${bid.vehicle.company}
                ModelYear: ${bid.vehicle.modelYear}
                Type: ${bid.vehicle.type}
                Transmission: ${bid.vehicle.transmission}
                Fuel Type: ${bid.vehicle.fuelType}
                `;
            }).join('\n');

            const currentBids = await Bidding.find({'vehicle._id': vehicleId, status: "pending"});
            const currentBidsText = currentBids.map((bid, index) => {
                const durationInDays = ((new Date(bid.endDate) - new Date(bid.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                const totalAmountAfterMultiplyingWithDuration = bid.amount * durationInDays;
                return `BidId: ${bid._id},
    Amount: $${bid.amount}
    Username: ${bid.from.username}
    User ID: ${bid.from._id}
    Vehicle ID: ${bid.vehicle._id}
    Start Date: ${bid.startDate}
    End Date: ${bid.endDate}
    Duration: ${durationInDays.toFixed(2)} days
    Total Amount After Multiplying With Duration: $${totalAmountAfterMultiplyingWithDuration.toFixed(2)}`;
    ;
            }).join('\n\n');

            const prompt = `
            SYSTEM INSTRUCTION:
            
            You are an AI bid analyzer for a car rental platform. Your task is to evaluate **current** bids for a specific vehicle and recommend the best bids while rejecting those that are overlapping and less optimal.
            
            🛑 RETURN ONLY A SINGLE JSON OBJECT. NO markdown, NO comments, NO extra text.
            
            ====================
            DATA INPUT
            ====================
            Vehicle ID: ${vehicleId}
            
            Historical Bids (Completed Rentals):
            ${bookingHistoryText || 'No historical bids available'}
            
            Current Bids (Pending):
            ${currentBidsText || 'No pending bids available'}
            
            ====================
            KEY OBJECTIVES
            ====================
            1. ✅ Recommend all **non-overlapping** current bids.
            2. 🔁 For overlapping current bids (bids that intersect in date ranges), recommend ONLY ONE optimal bid.
            3. ❌ Reject any other bids that overlap and are not selected.
            4. Do NOT reject any bids unless they **overlap** with a better bid.
            
            ====================
            📆 OVERLAPPING DEFINITION
            ====================
            Two bids are considered overlapping **only if**:
              Bid A's startDate <= Bid B's endDate AND Bid B's startDate <= Bid A's endDate  
            (Compare only the DATE part, not the time)
            
            ✅ Example of overlapping:
              Bid A: May 13 - May 15
              Bid B: May 14 - May 16
            
            ❌ Example of non-overlapping:
              Bid A: May 13 - May 13
              Bid B: May 27 - May 29
            
            ====================
            🏆 SELECTION LOGIC
            ====================
            1. For every overlapping group of bids
               - Calculate amountPerDay = totalAmountAfterMultiplyingWithDuration / number of rental days (inclusive)
               - Choose the bid with the **highest amountPerDay**
               - If multiple bids have the same amountPerDay, prefer the bid from a **returning user**
               - If multiple returning users are tied, prefer the one who has appeared **most frequently** in historical bookings
            
            2. Recommend all non-overlapping bids directly.
            
            3. Reject all other overlapping bids with a clear reason.
            
            ====================
            🔁 RETURNING USER DEFINITION
            ====================
            A returning user is someone whose username appears in the "User" field of the historical bookings.
            
            A "go-to user" is one who appears most frequently in historical bookings.
            
            ====================
            🧾 OUTPUT FORMAT STRICTLY FOLLOW THIS OUTPUT FORMAT OTHERWISE YOU WILL BE PENALIZED 
            ====================
            {
              "recommendedBids": [
                {
                  "_id": "BidId",
                  "amount": 1000,
                  "totalAmountAfterMultiplyingWithDuration": 1000,
                  "vehicle": {
                    "_id": "123",
                    "name": "Car Name",
                    "company": "Company Name",
                    "modelYear": 2020
                  },
                  "from": {
                    "username": "user123",
                    "_id": "456"
                  },
                  "status": "pending",
                  "startDate": "2025-05-13T00:00:00.000Z",
                  "endDate": "2025-05-13T00:00:00.000Z"
                }
                // more recommended bids...
              ],
              "rejectedBids": [
                {
                  "bid": {
                    "amount": 950,
                    "totalAmountAfterMultiplyingWithDuration": 2850,
                    "from": { "username": "user789", "_id": "999" },
                    "startDate": "2025-05-13T00:00:00.000Z",
                    "endDate": "2025-05-15T00:00:00.000Z"
                  },
                  "reason": "Overlaps with a higher amountPerDay bid from another user"
                }
                // more rejected bids...
              ],
              "reasoning": "All non-overlapping bids were accepted. Overlapping groups were evaluated based on highest amountPerDay, returning-user preference, and go-to user frequency."
            }
            
            ====================
            ADDITIONAL RULES
            ====================
            - Use the exact _id from the currentBids input.
            - Copy fields **exactly** as in the original bid objects (do not alter them).
            - Ensure dates stay in the original ISO format.
            - JSON must be syntactically valid.
            - DO NOT return markdown or any commentary.




            IN EVERY CASE YOU MUST MAINTAIN THE OUTPUT FORMAT STRICTLY OTHERWISE YOU WILL BE PENALIZED AND MY APP WILL CRASH
            `;
            
            
            

            
            
            const response = await this.generateResponse(prompt);
            
            try {
                // Clean the response by removing any markdown formatting
                const cleanedResponse = response.replace(/```json\s*|\s*```/g, '').trim();
                const parsedResponse = JSON.parse(cleanedResponse);

                // If there's a recommended bid, ensure all required fields are present
                if (parsedResponse.recommendedBid) {
                    const recommendedBid = parsedResponse.recommendedBid;
                    if (!recommendedBid.amount || !recommendedBid.vehicle?._id || 
                        !recommendedBid.from?.username || !recommendedBid.from?._id ||
                        !recommendedBid.startDate || !recommendedBid.endDate) {
                        throw new Error('Missing required fields in recommended bid');
                    }
                }

                return parsedResponse;
            } catch (error) {
                console.error('Failed to parse Gemini response:', error);
                console.error('Raw response:', response);
                throw new Error('Invalid response format from Gemini');
            }
        } catch (error) {
            console.error('GetOptimalBid Error:', error);
            throw new Error(`Failed to get optimal bid: ${error.message}`);
        }
    }
}

export default GeminiService; 
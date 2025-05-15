import Review from "../models/review.model.js";
import { generateText } from "../services/gemini.service.js";

/**
 * function to get the review summary for a seller within a specified date range 
 * @param {*} req 
 * @param {*} res 
 * @returns returns the review summary for the seller using the gemini service, generating insights based on the reviews
 */
export const getReviewSummaryController = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { startDate, endDate } = req.query;
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }
    
    // Query reviews for the seller's vehicles within the date range
    const reviews = await Review.aggregate([
      {
        $match: {
          'owner._id': sellerId,
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $project: {
          _id: 1,
          rating: 1,
          review: 1,
          createdAt: 1,
          reviewer: 1,
          'vehicle._id': 1,
          'vehicle.name': 1,
          'vehicle.company': 1,
          'vehicle.modelYear': 1,
          'vehicle.price': 1,
          'vehicle.color': 1,
          'vehicle.mileage': 1,
          'vehicle.city': 1,
          'vehicle.category': 1  // Keep category for internal grouping but won't send to AI
        }
      }
    ]);
    
    if (reviews.length === 0) {
      return res.status(200).json({
        message: "No reviews found for the given date range",
        summary: "No data available to generate insights.",
        reviews: [],
        analysis: {
          summary: "No reviews found for analysis",
          strengths: [],
          improvementAreas: [],
          vehicleInsights: "Not enough data",
          geographicalInsights: "Not enough data",
          recommendations: ["Encourage customers to leave reviews after their rental experience"],
          trends: "Not enough data to analyze trends"
        }
      });
    }
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);
    
    // Group reviews by rating category
    const positiveReviews = reviews.filter(review => review.rating >= 4);
    const neutralReviews = reviews.filter(review => review.rating === 3);
    const negativeReviews = reviews.filter(review => review.rating < 3);
    
    // Group by vehicle category and city (for internal analysis only)
    const reviewsByCategory = {};
    const reviewsByCity = {};
    
    reviews.forEach(review => {
      const category = review.vehicle?.category || 'Unknown';
      const city = review.vehicle?.city || 'Unknown';
      
      if (!reviewsByCategory[category]) reviewsByCategory[category] = [];
      if (!reviewsByCity[city]) reviewsByCity[city] = [];
      
      reviewsByCategory[category].push(review);
      reviewsByCity[city].push(review);
    });
    
    // Prepare review text for Gemini analysis including all vehicle data except category
    const reviewTexts = reviews.map(r => ({
      text: r.review,
      rating: r.rating,
      vehicle: {
        id: r.vehicle?._id || 'Unknown',
        name: r.vehicle?.name || 'Unknown',
        company: r.vehicle?.company || 'Unknown',
        modelYear: r.vehicle?.modelYear || 'Unknown',
        price: r.vehicle?.price || 'Unknown',
        color: r.vehicle?.color || 'Unknown',
        mileage: r.vehicle?.mileage || 'Unknown',
        city: r.vehicle?.city || 'Unknown'
      },
      createdAt: r.createdAt
    }));
    
    // Generate Gemini prompt for analysis
    const prompt = `
      As an expert car rental business consultant, analyze the following ${reviews.length} customer reviews for a car rental seller from ${startDate} to ${endDate}.
      
      Review data:
      ${JSON.stringify(reviewTexts)}
      
      Overall statistics:
      - Average rating: ${averageRating}
      - Positive reviews (4-5 stars): ${positiveReviews.length}
      - Neutral reviews (3 stars): ${neutralReviews.length}
      - Negative reviews (1-2 stars): ${negativeReviews.length}
      
      Based on this data, please provide a comprehensive analysis with the following sections:
      
      1. SUMMARY: A brief executive summary of the overall review sentiment and key themes.
      
      2. STRENGTHS: Identify 2-3 key strengths consistently mentioned in positive reviews.
      
      3. AREAS FOR IMPROVEMENT: Identify 2-3 specific areas that need improvement based on negative and neutral reviews.
      
      4. VEHICLE INSIGHTS: Analyze vehicle performance based on all vehicle attributes (company, name, model year, price, color, mileage). Identify patterns in which vehicles receive better/worse reviews.
      
      5. GEOGRAPHICAL INSIGHTS: Are there notable differences in customer satisfaction across different cities? Provide location-specific recommendations.
      
      6. ACTIONABLE RECOMMENDATIONS: Provide 3-5 specific, actionable steps the seller should take to improve their ratings and customer satisfaction.
      
      7. TRENDS: Have reviews improved or declined over the time period? Identify any notable patterns related to specific vehicles or vehicle attributes.
      
      Format your response as JSON with the following structure:
      {
        "summary": "Brief executive summary",
        "strengths": ["strength1", "strength2", ...],
        "improvementAreas": ["area1", "area2", ...],
        "vehicleInsights": "Analysis of vehicle performance based on all attributes",
        "geographicalInsights": "Analysis of city-based performance",
        "recommendations": ["recommendation1", "recommendation2", ...],
        "trends": "Analysis of rating trends over time"
      }
    `;
    
    // Call Gemini API for analysis
    const geminiResponse = await generateText(prompt, { temperature: 0.2 });
    
    // Parse the JSON response
    let analysisResults;
    try {
      // Find JSON object in the response
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      
      // If the match is not found, try to parse the entire response
      analysisResults = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(geminiResponse);
      
      if (!analysisResults) {
        throw new Error("Failed to parse Gemini response as JSON");
      }
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      
      // Provide a fallback analysis if parsing fails
      analysisResults = {
        summary: "Analysis summary unavailable. The system encountered an error processing your review data.",
        strengths: ["Review data available but analysis failed"],
        improvementAreas: ["System error - try again later"],
        vehicleInsights: "Analysis unavailable due to technical issues",
        geographicalInsights: "Analysis unavailable due to technical issues",
        recommendations: ["Try again later", "Contact support if the issue persists"],
        trends: "Trend analysis unavailable due to technical issues"
      };
    }
    
    // Return the summary along with review stats
    return res.status(200).json({
      reviewPeriod: {
        startDate,
        endDate
      },
      totalReviews: reviews.length,
      averageRating,
      reviewDistribution: {
        positive: positiveReviews.length,
        neutral: neutralReviews.length,
        negative: negativeReviews.length
      },
      analysis: analysisResults,
      reviews: reviews.slice(0, 5) 
    });
    
  } catch (error) {
    console.error("Error in getReviewSummaryController:", error);
    return res.status(500).json({
      error: "Failed to generate review summary",
      message: error.message
    });
  }
};
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Booking } from "../models/booking.model.js";
import { Car } from "../models/car.model.js";
import { Bid } from "../models/bid.model.js";
import mongoose from 'mongoose';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: safetySettings
});

const prepareOwnerHistoricalData = async (ownerId, timeframe) => {
    console.log(ownerId);
    ownerId = new mongoose.Types.ObjectId(ownerId);
    const startDate = new Date(Date.now() - timeframe);

    const bookingData = await Booking.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                'bid.car.owner.userId': ownerId
            }
        },
        {
            $project: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: "$totalFare",
                category: "$bid.car.category.categoryName",
                rentalType: 1,
                duration: {
                    $divide: [
                        { $subtract: ["$toTimestamp", "$fromTimestamp"] },
                        1000 * 60 * 60
                    ]
                },
                carId: "$bid.car.carId",
                carName: "$bid.car.carName"
            }
        }
    ]);

    const bidData = await Bid.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                "car.owner.userId": ownerId
            }
        },
        {
            $project: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                bidAmount: 1,
                status: 1,
                carId: "$car.carId",
                carName: "$car.carName"
            }
        }
    ]);

    return {
        bookings: bookingData,
        bids: bidData
    };
};

const prepareAdminHistoricalData = async (timeframe) => {
    const startDate = new Date(Date.now() - timeframe);

    const platformData = await Promise.all([
        Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $project: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: "$totalFare",
                    category: "$bid.car.category.categoryName",
                    city: "$bid.car.city",
                    userId: "$bid.user.userId"
                }
            }
        ]),
        Bid.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $project: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    bidAmount: 1,
                    status: 1,
                    city: "$car.city",
                    category: "$car.category.categoryName"
                }
            }
        ])
    ]);

    return {
        bookings: platformData[0],
        bids: platformData[1]
    };
};

const createOwnerPredictionPrompt = (historicalData) => {
    return `
        Analyze this car rental data and provide detailed predictions and recommendations for the car owner:
        
        1. Revenue Forecasting:
        - Expected revenue for next 30 days
        - Seasonal trends and patterns
        - Best performing car categories
        
        2. Demand Prediction:
        - Expected booking volume
        - Peak booking times and days
        - Most popular rental durations
        
        3. Pricing Optimization:
        - Recommended bid amounts for different car categories
        - Dynamic pricing suggestions based on demand
        
        4. Resource Optimization:
        - Car availability recommendations
        - Maintenance scheduling suggestions
        
        Historical Data:
        ${JSON.stringify(historicalData)}
        
        Please provide specific, actionable insights with numerical predictions where possible.
    `;
};

const createAdminPredictionPrompt = (historicalData) => {

    const totalBookings = historicalData.bookings.length;
    const totalRevenue = historicalData.bookings.reduce((sum, booking) => sum + booking.revenue, 0);
    const uniqueUsers = new Set(historicalData.bookings.map(booking => booking.userId)).size;
    const uniqueCities = new Set(historicalData.bookings.map(booking => booking.city)).size;
    const categories = [...new Set(historicalData.bookings.map(booking => booking.category))];
    const totalBids = historicalData.bids.length;
    const acceptedBids = historicalData.bids.filter(bid => bid.status === 'accepted').length;
    const bidSuccessRate = (acceptedBids / totalBids) * 100;

    return `
        Based on the following historical data, provide predictions in a structured format that can be easily parsed.
        IMPORTANT: Follow the EXACT format below, including all section headers and formatting:

        Expected User Growth: [number]-[number] (e.g., "100-150")
        Revenue Projection: $[number,number].[number] - $[number,number].[number] (e.g., "$10,000.00 - $15,000.00")
        Bid Success Rate: [number].[number]% (e.g., "75.5%")

        Customer Retention Predictions:
        [Detailed text about customer retention]

        Churn Risk Assessment:
        [Detailed text about churn risk]

        Popular Cities and Regions:
        [List cities exactly as: City1, City2, City3]
        Example: Delhi, Noida, Mumbai

        Category Performance Trends:
        [List each category exactly as: CategoryName: PerformanceStatus]
        Example: Sedan: Active, SUV: Active

        Further Recommendations:
        * [First recommendation]
        * [Second recommendation]
        * [Third recommendation]
        * [Fourth recommendation]
        * [Fifth recommendation]

        Current Platform Metrics:
        - Total Bookings: ${totalBookings}
        - Total Revenue: ${totalRevenue}
        - Unique Users: ${uniqueUsers}
        - Active Cities: ${Array.from(uniqueCities).join(', ')}
        - Categories: ${categories.join(', ')}
        - Bid Success Rate: ${bidSuccessRate.toFixed(2)}%

        Historical Data:
        ${JSON.stringify(historicalData)}

        CRITICAL FORMATTING RULES:
        1. Each section MUST start with its exact header as shown above
        2. Popular Cities MUST be comma-separated with no additional text
        3. Category Performance MUST list each category as "Category: Status"
        4. Recommendations MUST start with "* " and be on separate lines
        5. Do not add any additional text or explanations outside the specified format
        6. Maintain exact spacing between sections
        7. Do not include any markdown formatting or special characters
    `;
};

const generateContentWithRetry = async (prompt, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            if (attempt === maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
};

export const getOwnerPredictions = async (req, res) => {
    try {
        const { ownerId, timeframe = 30 * 24 * 60 * 60 * 1000 } = req.body;

        if (!ownerId) {
            return res.status(400).json({
                msg: "Owner ID is required"
            });
        }

        const historicalData = await prepareOwnerHistoricalData(ownerId, timeframe);
        const prompt = createOwnerPredictionPrompt(historicalData);

        const predictions = await generateContentWithRetry(prompt);

        res.status(200).json({
            success: true,
            data: {
                predictions,
                historicalData: historicalData
            }
        });
    } catch (error) {
        console.error("Error in getOwnerPredictions:", error);
        res.status(500).json({
            success: false,
            msg: "Error generating owner predictions",
            error: error.message
        });
    }
};

// Get predictions for admin
export const getAdminPredictions = async (req, res) => {
    try {
        const { timeframe = 30 * 24 * 60 * 60 * 1000 } = req.body;
        const historicalData = await prepareAdminHistoricalData(timeframe);
        const prompt = createAdminPredictionPrompt(historicalData);

        const predictions = await generateContentWithRetry(prompt);

        res.status(200).json({
            success: true,
            data: {
                predictions,
                historicalData: historicalData
            }
        });
    } catch (error) {
        console.error("Error in getAdminPredictions:", error);
        res.status(500).json({
            success: false,
            msg: "Error generating admin predictions",
            error: error.message
        });
    }
};

// Get specific car predictions for owner
export const getCarSpecificPredictions = async (req, res) => {
    try {
        const { ownerId, carId, timeframe = 30 * 24 * 60 * 60 * 1000 } = req.body;
        if (!ownerId || !carId) {
            return res.status(400).json({
                msg: "Owner ID and Car ID are required"
            });
        }

        const historicalData = await prepareOwnerHistoricalData(ownerId, timeframe);

        const carSpecificData = {
            bookings: historicalData.bookings.filter(
                booking => booking.carId == carId
            ),
            bids: historicalData.bids.filter(
                bid => bid.carId == carId
            )
        };

        const prompt = createOwnerPredictionPrompt(carSpecificData);
        const predictions = await generateContentWithRetry(prompt);

        res.status(200).json({
            success: true,
            data: {
                predictions,
                historicalData: carSpecificData
            }
        });
    } catch (error) {
        console.error("Error in getCarSpecificPredictions:", error);
        res.status(500).json({
            success: false,
            msg: "Error generating car-specific predictions",
            error: error.message
        });
    }
};

// Get category-specific predictions for admin
export const getCategoryPredictions = async (req, res) => {
    try {
        const { category, timeframe = 30 * 24 * 60 * 60 * 1000 } = req.body;

        if (!category) {
            return res.status(400).json({
                msg: "Category is required"
            });
        }

        const historicalData = await prepareAdminHistoricalData(timeframe);

        // Filter data for specific category
        const categorySpecificData = {
            bookings: historicalData.bookings.filter(
                booking => booking.category === category
            ),
            bids: historicalData.bids.filter(
                bid => bid.category === category
            )
        };

        const prompt = createAdminPredictionPrompt(categorySpecificData);
        const predictions = await generateContentWithRetry(prompt);

        res.status(200).json({
            success: true,
            data: {
                predictions,
                historicalData: categorySpecificData
            }
        });
    } catch (error) {
        console.error("Error in getCategoryPredictions:", error);
        res.status(500).json({
            success: false,
            msg: "Error generating category predictions",
            error: error.message
        });
    }
}; 
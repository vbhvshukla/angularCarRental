import client from "../services/redis.service.js";

/**
 * Middleware to check for cached data in Redis
 * @param {string} cacheKeyPrefix - Prefix for the Redis cache key
 */

export const cacheMiddleware = (cacheKeyPrefix) => async (req, res, next) => {
    try {
        const ownerId = req.body.ownerId;
        const cacheKey = `${cacheKeyPrefix}:${ownerId}`;

        // Check if data exists in Redis
        const cachedData = await client.get(cacheKey);
        if (cachedData) {
            console.log("Cache Hit!");
            return res.status(200).json(JSON.parse(cachedData));
        }

        // Attach cacheKey to the request object for later use
        req.cacheKey = cacheKey;

        next(); // Proceed to the controller
    } catch (error) {
        console.error("Error in cache middleware:", error);
        next();
    }
};
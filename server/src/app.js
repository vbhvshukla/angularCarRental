import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import carRoutes from "./routes/car.routes.js";
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import bidRoutes from "./routes/bid.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import cityRoutes from "./routes/city.routes.js";
import availabilityRoutes from "./routes/caravailability.routes.js";
import ownerAnalyticsRoutes from "./routes/ownerAnalytics.routes.js";
import adminAnalyticsRoutes from "./routes/adminAnalytics.routes.js";
import predictiveAnalyticsRoutes from "./routes/predictiveAnalytics.routes.js";

/** For OpenAPI Docs */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Express Instance */
const app = express();

/** Middlewares */

//CORS configuration
app.use(cors({
    origin: "http://127.0.0.1:5500",
    credentials: true
}));

//Logging : Morgan

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }))

//URL Encoded Configuration
app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb",
    })
);

app.use(express.json());

//Cookie Parser Configuration
app.use(cookieParser());

// Passport Middleware
app.use(passport.initialize());

/** Error Event Handling */
app.on("error", (error) => {
    console.error("App Error ::", error);
    // throw error;
});

/** Routes */
const API_PREFIX = process.env.API_PREFIX || '/api/v1';
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/car`, carRoutes);
app.use(`${API_PREFIX}/user`, userRoutes);
app.use(`${API_PREFIX}/category`, categoryRoutes);
app.use(`${API_PREFIX}/bid`, bidRoutes);
app.use(`${API_PREFIX}/booking`, bookingRoutes);
app.use(`${API_PREFIX}/chat`, chatRoutes);
app.use(`${API_PREFIX}/city`, cityRoutes);
app.use(`${API_PREFIX}/caravailability`, availabilityRoutes);
app.use(`${API_PREFIX}/owneranalytics`, ownerAnalyticsRoutes);
app.use(`${API_PREFIX}/adminanalytics`, adminAnalyticsRoutes);
app.use(`${API_PREFIX}/predictive`, predictiveAnalyticsRoutes);

/** OpenAPI documentation*/
const openapiPath = path.resolve(__dirname, '../docs/openapi.json');
const openapiDocument = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));


export { app }
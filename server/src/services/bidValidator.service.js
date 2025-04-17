import { body, param, validationResult } from "express-validator";

export const bidValidationRules = [
    // Validate carId
    body("carId")
        .isMongoId()
        .withMessage("Car ID must be a valid MongoDB ObjectId.")
        .notEmpty()
        .withMessage("Car ID is required."),

    // Validate bidData fields
    body("bidData.startDate")
        .isISO8601()
        .withMessage("Start date must be a valid ISO8601 date.")
        .notEmpty()
        .withMessage("Start date is required."),
    body("bidData.endDate")
        .isISO8601()
        .withMessage("End date must be a valid ISO8601 date.")
        .notEmpty()
        .withMessage("End date is required."),
    body("bidData.rentalType")
        .isIn(["local", "outstation"])
        .withMessage("Rental type must be either 'local' or 'outstation'.")
        .notEmpty()
        .withMessage("Rental type is required."),
    body("bidData.bidAmount")
        .isNumeric()
        .withMessage("Bid amount must be a number.")
        .notEmpty()
        .withMessage("Bid amount is required."),

    // Validate userData fields
    body("userData._id")
        .isMongoId()
        .withMessage("User ID must be a valid MongoDB ObjectId.")
        .notEmpty()
        .withMessage("User ID is required."),
    body("userData.username")
        .isString()
        .withMessage("Username must be a string.")
        .notEmpty()
        .withMessage("Username is required."),
    body("userData.email")
        .isEmail()
        .withMessage("Email must be a valid email address.")
        .notEmpty()
        .withMessage("Email is required."),
    body("userData.role")
        .isIn(["owner", "admin", "customer"])
        .withMessage("Role must be one of 'owner', 'admin', or 'customer'.")
        .notEmpty()
        .withMessage("Role is required."),
        
    // Add validation middleware
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateBidId = [
    param("bidId")
        .isMongoId()
        .withMessage("Bid ID must be a valid MongoDB ObjectId.")
        .notEmpty()
        .withMessage("Bid ID is required."),
        
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateUpdateStatus = [
    param("bidId")
        .isMongoId()
        .withMessage("Bid ID must be a valid MongoDB ObjectId.")
        .notEmpty()
        .withMessage("Bid ID is required."),
        
    body("status")
        .isIn(["pending", "accepted", "rejected", "cancelled"])
        .withMessage("Status must be one of 'pending', 'accepted', 'rejected', or 'cancelled'.")
        .notEmpty()
        .withMessage("Status is required."),
        
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateCarId = [
    param("carId")
        .isMongoId()
        .withMessage("Car ID must be a valid MongoDB ObjectId.")
        .notEmpty()
        .withMessage("Car ID is required."),
        
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateUserId = [
    param("userId")
        .isMongoId()
        .withMessage("User ID must be a valid MongoDB ObjectId.")
        .notEmpty()
        .withMessage("User ID is required."),
        
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateOwnerId = [
    param("ownerId")
        .isMongoId()
        .withMessage("Owner ID must be a valid MongoDB ObjectId.")
        .notEmpty()
        .withMessage("Owner ID is required."),
        
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];



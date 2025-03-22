import { body, validationResult } from "express-validator";

const validateCarCreation = [
    body("carName").notEmpty().withMessage("Validation Error :: Car name is required"),
    body("carType")
        .isIn(["automatic", "manual"])
        .withMessage("Validation Error :: Car type must be either 'automatic' or 'manual'"),
    body("featured")
        .isArray()
        .withMessage("Validation Error :: Featured must be an array")
        .optional(),
    body("city").notEmpty().withMessage("Validation Error :: City is required"),
    body("description").notEmpty().withMessage("Validation Error :: Description is required"),
    body("images")
        .isArray({ min: 1 })
        .withMessage("Validation Error :: At least one image is required"),
    body("isAvailableForLocal")
        .isBoolean()
        .withMessage("Validation Error :: isAvailableForLocal must be a boolean"),
    body("isAvailableForOutstation")
        .isBoolean()
        .withMessage("Validation Error :: isAvailableForOutstation must be a boolean"),
    body("rating.avgRating")
        .optional()
        .isNumeric()
        .withMessage("Validation Error :: avgRating must be a number"),
    body("rating.ratingCount")
        .optional()
        .isNumeric()
        .withMessage("Validation Error :: ratingCount must be a number"),
    body("owner._id")
        .notEmpty()
        .withMessage("Validation Error :: Owner ID is required")
        .isMongoId()
        .withMessage("Validation Error :: Owner ID must be a valid MongoDB ObjectId"),
    body("owner.username").notEmpty().withMessage("Validation Error :: Owner username is required"),
    body("owner.email")
        .isEmail()
        .withMessage("Validation Error :: Owner email must be a valid email address"),
    body("category._id")
        .notEmpty()
        .withMessage("Validation Error :: Category ID is required")
        .isMongoId()
        .withMessage("Validation Error :: Category ID must be a valid MongoDB ObjectId"),
    body("category.categoryName")
        .notEmpty()
        .withMessage("Validation Error :: Category name is required"),
    body("rentalOptions.local.pricePerHour")
        .optional()
        .isNumeric()
        .withMessage("Validation Error :: Local price per hour must be a number"),
    body("rentalOptions.outstation.pricePerDay")
        .optional()
        .isNumeric()
        .withMessage("Validation Error :: Outstation price per day must be a number"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export { validateCarCreation };
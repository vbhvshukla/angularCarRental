import { body } from "express-validator";

export const bookingValidationRules = [
    body("baseFare")
        .isNumeric()
        .withMessage("Base fare must be a number.")
        .notEmpty()
        .withMessage("Base fare is required."),
    body("fromTimestamp")
        .isISO8601()
        .withMessage("From timestamp must be a valid date.")
        .notEmpty()
        .withMessage("From timestamp is required."),
    body("toTimestamp")
        .isISO8601()
        .withMessage("To timestamp must be a valid date.")
        .notEmpty()
        .withMessage("To timestamp is required."),
    body("status")
        .isIn(["pending", "confirmed", "completed", "cancelled"])
        .withMessage("Status must be one of 'pending', 'confirmed', 'completed', or 'cancelled'."),
    body("rentalType")
        .isIn(["local", "outstation"])
        .withMessage("Rental type must be either 'local' or 'outstation'.")
        .notEmpty()
        .withMessage("Rental type is required."),
    body("extraKmCharges")
        .optional()
        .isNumeric()
        .withMessage("Extra km charges must be a number."),
    body("extraHourCharges")
        .optional()
        .isNumeric()
        .withMessage("Extra hour charges must be a number."),
    body("extraDayCharges")
        .optional()
        .isNumeric()
        .withMessage("Extra day charges must be a number."),
    body("totalFare")
        .isNumeric()
        .withMessage("Total fare must be a number.")
        .notEmpty()
        .withMessage("Total fare is required."),
    body("bid")
        .optional()
        .isObject()
        .withMessage("Bid must be a valid object."),
];
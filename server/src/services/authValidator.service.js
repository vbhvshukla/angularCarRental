import { body, validationResult } from "express-validator";

const validRoles = ['admin', 'customer', 'owner'];

export const validateRegister = [
    body('username').notEmpty().withMessage("Validation Error :: Username is Required!"),
    body('email').isEmail().withMessage("Validation Error :: Invalid Email Format"),
    body('password')
        .isLength({ min: 8 })
        .withMessage("Validation Error :: Password must be atleast 8 characters long")
        .matches(/[A-Z]/)
        .withMessage("Validation Error :: Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Validation Error :: Password must contain at least one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Validation Error :: Password must contain at least one number")
        .matches(/[@$!%*?&]/)
        .withMessage("Validation Error :: Password must contain at least one special character"),
    body('role').isIn(validRoles)
        .withMessage('Validation Error :: Invalid Role'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        next();
    }
]

export const validateLogin = [
    body('email').isEmail().withMessage("Validation Error :: Invalid Email Format"),
    body('password').notEmpty().withMessage('Validation Error :: Password is Required!'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        next();
    }
]
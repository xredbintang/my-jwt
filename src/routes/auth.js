const express = require("express");
const router = express.Router();
const authControll = require('../controllers/auth');
const {body, validationResult} = require("express-validator");

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next(); 
    }
    const extractedErrors = [];
    
    errors.array().map(err => {
    extractedErrors.push({ [err.path || err.param]: err.msg });
    });

    return res.status(422).json({ // 422 Unprocessable Entity
        message: "Validation failed. Please check your input.",
        errors: extractedErrors,
    });
};

const registerValidationRules = [
    body('email')
        .trim() 
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
        // .matches(/\d/).withMessage('Password must contain a number')
        // .matches(/[a-zA-Z]/).withMessage('Password must contain a letter'),
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required.')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long.')
        .escape()
];

const loginValidationRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Invalid email format.')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required.')
];

const refreshTokenValidationRules = [
    body('refreshToken')
        .if(body('refreshToken').exists())
        .notEmpty().withMessage('Refresh token in body cannot be empty if provided.')
        .isJWT().withMessage('Refresh token must be a valid JWT.') 
];

router.post('/register', registerValidationRules, handleValidationErrors, authControll.register);
router.post('/login', loginValidationRules, handleValidationErrors, authControll.login);
router.post('/refresh-token', registerValidationRules, handleValidationErrors, authControll.refreshToken);
router.post('/logout', authControll.logout);

module.exports = router;
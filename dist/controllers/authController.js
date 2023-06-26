"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialAuth = exports.resetPassword = exports.forgotPassword = exports.login = exports.signup = void 0;
const tokens_1 = require("../utils/tokens");
const createSendToken_1 = __importDefault(require("../utils/createSendToken"));
const userSchema_1 = require("../models/userSchema");
const appError_1 = __importDefault(require("../utils/appError"));
const emails_1 = __importDefault(require("../utils/emails"));
const crypto_1 = __importDefault(require("crypto"));
require('dotenv').config();
/**
 * SIGNUP
 * @returns Response
 */
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username } = req.body;
    try {
        if (!(email && password && username)) {
            throw new appError_1.default('Please provide full sign up details', 401);
        }
        const oldUser = yield userSchema_1.Users.findOne({ email });
        if (oldUser)
            throw new appError_1.default("User already exists. Please login", 409);
        const user = yield userSchema_1.Users.create(req.body);
        (0, createSendToken_1.default)(user, 201, res);
    }
    catch (error) {
        next(new appError_1.default(error.message, error.statusCode));
        return;
    }
});
exports.signup = signup;
/**
 * LOGIN
 * @returns Response
 */
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        if (!(email || password)) {
            throw new appError_1.default('Please provide login details', 400);
        }
        const user = yield userSchema_1.Users.findOne({ email });
        // CHECK IF USER EXISTS WITHOUT LEAKING EXTRA INFOS
        if (!user || !(yield user.isValidPassword(password))) {
            throw new appError_1.default('Email or Password incorrect', 401);
        }
        (0, createSendToken_1.default)(user, 201, res);
    }
    catch (error) {
        next(new appError_1.default(error.message, error.statusCode));
        return;
    }
});
exports.login = login;
/**
 * FORGOT PASSWORD
 * @returns Response
 */
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield userSchema_1.Users.findOne({ email });
        if (!user)
            throw new appError_1.default("No User with that email", 401);
        const { resetToken, passwordToken, passwordResetExpiry } = (0, tokens_1.createPasswdResetToken)();
        user.passwordToken = passwordToken;
        user.passwordResetExpiry = passwordResetExpiry;
        yield user.save();
        const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/resetpassword/${resetToken}`;
        // if (process.env.NODE_ENV === 'production') {
        yield new emails_1.default(user, resetUrl).sendPasswordReset();
        // }
        // SEND RESPONSE
        res.status(200).json({
            status: "success",
            message: `Token sent to mail ${resetUrl}`,
        });
    }
    catch (error) {
        next(new appError_1.default(error.message, error.statusCode));
        return;
    }
});
exports.forgotPassword = forgotPassword;
/**
 * RESET PASSWORD
 * @returns Response
 */
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // CREATE A HASHED TOKEN FROM THE REQ PARAMS
    const hashedToken = crypto_1.default
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    try {
        const user = yield userSchema_1.Users.findOne({
            passwordToken: hashedToken,
            passwordResetExpiry: { $gte: Date.now() }
        });
        if (!user)
            throw new appError_1.default('Expired or Invalid Token! Please try again', 403);
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        if (password !== confirmPassword) {
            throw new appError_1.default('Password and ConfirmPassword must be same', 403);
        }
        user.password = password;
        user.passwordToken = null;
        user.passwordResetExpiry = null;
        yield user.save();
        const url = `${req.protocol}://${req.get("host")}/api/v1/auth/login`;
        // if (process.env.NODE_ENV === 'production') {
        yield new emails_1.default(user, url).sendVerifiedPSWD();
        // }
        // LOG IN USER AND SEND JWT
        (0, createSendToken_1.default)(user, 200, res);
    }
    catch (error) {
        next(new appError_1.default(error.message, error.statusCode));
        return;
    }
});
exports.resetPassword = resetPassword;
const redirectURL = 'http://localhost:3000';
/**
 * Social Auth Controller
 */
const socialAuth = (req, res, next) => {
    // OBTAIN USER DETAILS FROM SESSION
    const { user: { user, token, oldUser } } = req.session.passport;
    const cookieOptions = {
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === "production")
        cookieOptions.secure = true;
    // Send token to client
    res.cookie("jwt", token, cookieOptions);
    res.redirect('/');
};
exports.socialAuth = socialAuth;

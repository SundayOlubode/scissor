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
exports.login = exports.signup = void 0;
const appError_1 = __importDefault(require("../utils/appError"));
const userSchema_1 = require("../models/userSchema");
const { createSendToken } = require('../utils/createSendToken');
const tokens_1 = require("../utils/tokens");
const { EmailToUsers } = require('../utils/emails');
require('dotenv').config();
const crypto = require('crypto');
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, firstname, lastname, role, adminCode } = req.body;
    try {
        if (!(email && password && firstname && lastname)) {
            throw new appError_1.default('Please provide full sign up details', 401);
        }
        const oldUser = yield userSchema_1.Users.findOne({ email });
        if (oldUser)
            throw new appError_1.default("User already exists. Please login", 409);
        // VERIFY ADMIN REGISTRATION
        if (role) {
            // CHECK CODE
            if (`${adminCode}` !== process.env.ADMIN_CODE)
                throw (new appError_1.default('Incorrect Admin Code!', 400));
        }
        const user = yield userSchema_1.Users.create(req.body);
        // SEND WELCOME MAIL
        let url = process.env.WELCOMEURL;
        // await new EmailToUsers(user, url).sendWelcome()
        createSendToken(user, 201, res);
    }
    catch (error) {
        return next(new appError_1.default(error.message, error.statusCode));
    }
});
exports.signup = signup;
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
        createSendToken(user, 201, res);
    }
    catch (error) {
        return next(new appError_1.default(error.message, error.statusCode));
    }
});
exports.login = login;
exports.forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield userSchema_1.Users.findOne({ email });
        if (!user)
            throw new appError_1.default("No User with that email", 401);
        const { resetToken, passwordToken, passwordResetExpiry } = (0, tokens_1.createPasswdResetToken)();
        user.passwordToken = passwordToken;
        user.passwordResetExpiry = passwordResetExpiry;
        yield user.save();
        //SEND MAIL TO USER TO RESET PASSWORD
        const resetUrl = `${req.protocol}://${req.get("host")}/api/v2/auth/resetpassword/${resetToken}`;
        //5. SEND EMAIL TO CLIENT
        yield new EmailToUsers(user, resetUrl).sendPasswordReset();
        //6. SEND JSON RESPONSE
        res.status(200).json({
            status: "success",
            message: `Token sent to mail ${resetUrl}`,
        });
    }
    catch (error) {
        return next(new appError_1.default(error.message, error.statusCode));
    }
});
//RESET PASSWORD
exports.resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //1. CREATE A HASHED TOKEN FROM THE REQ PARAMS
    const hashedToken = crypto
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
        if (!(password === confirmPassword)) {
            throw new appError_1.default('Password and ConfirmPassword must be same', 403);
        }
        user.password = password;
        user.passwordToken = null;
        user.passwordResetExpiry = null;
        yield user.save();
        const url = `${req.protocol}://${req.get("host")}/api/v1/auth/login`;
        // SEND SUCCESS MAIL TO CLIENT
        yield new EmailToUsers(user, url).sendVerifiedPSWD();
        // LOG IN USER AND SEND JWT
        createSendToken(user, 200, res);
    }
    catch (error) {
        return next(new appError_1.default(error.message, error.statusCode));
    }
});

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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appError_1 = __importDefault(require("../utils/appError"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const userSchema_1 = require("../models/userSchema");
/**
 * Check User Authorization
 * @returns void
 */
const authorize = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token;
        if (process.env.NODE_ENV === "development") {
            const authHeader = req.headers.authorization;
            if (!authHeader)
                throw new appError_1.default("You are not logged in, Please Login Again", 403);
            //Save token from authHeader if available
            token = authHeader.split(" ")[1];
        }
        else if (process.env.NODE_ENV === "production") {
            const cookieValue = req.cookies.jwt;
            if (!cookieValue)
                throw new appError_1.default("You are not logged in, Please Login Again", 403);
            //SAVE TOKEN FROM COOKIE
            token = req.cookies.jwt;
        }
        // verify token
        const verifiedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        //Check if Users exists
        const currentUser = yield userSchema_1.Users.findById(verifiedToken.user_id);
        if (!currentUser)
            throw new appError_1.default("Account Not Found, Please Login again!", 401);
        //Add Users to req object
        req.user = (currentUser._id).toString();
        next();
    }
    catch (error) {
        next(new appError_1.default(error.message, error.statusCode));
        return;
    }
});
exports.default = authorize;

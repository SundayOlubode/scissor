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
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const userSchema_1 = require("../models/userSchema");
const appError_1 = __importDefault(require("../utils/appError"));
//STRATEGIES
const passport_google_oauth2_1 = __importDefault(require("passport-google-oauth2"));
const HOSTNAME = (process.env.NODE_ENV === 'production') ? 'https://www.circle7.codes' : `http://localhost:${process.env.PORT}`;
const GoogleStrategy = passport_google_oauth2_1.default.Strategy;
// GOOGLE STARTEGY
passport_1.default.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${HOSTNAME}/api/v1/auth/google/callback`,
    scope: ['profile', 'email'],
    passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    const googleDetails = {
        googleId: profile.id,
        email: profile.email,
        username: profile.displayName,
    };
    if (!googleDetails) {
        const error = new appError_1.default("User credentials are required!", 401);
        done(error);
    }
    // CHECK IF USER EXISTS OR CREATE USER
    try {
        const oldUser = yield userSchema_1.Users.findOne({
            where: { googleId: googleDetails.googleId },
        });
        // IF USER EXISTS SEND USER WITH TOKEN
        if (oldUser) {
            const token = yield oldUser.createJwt();
            return done(null, { oldUser, token });
        }
        // CREATE USER IF NEW
        const user = yield userSchema_1.Users.create(Object.assign({}, googleDetails));
        const token = yield user.createJwt();
        done(null, { user, token });
    }
    catch (error) {
        done(error);
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});

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
exports.Users = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    createdAt: {
        type: String
    },
    passwordToken: String,
    passwordResetExpiry: Date,
});
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.password)
            return next();
        this.password = yield bcrypt_1.default.hash(this.password, 10);
        next();
    });
});
userSchema.methods.isValidPassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(password, this.password);
    });
};
userSchema.methods.createJwt = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return yield jsonwebtoken_1.default.sign({ user_id: this.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES,
        });
    });
};
exports.Users = (0, mongoose_1.model)('User', userSchema);

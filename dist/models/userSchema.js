"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
const mongoose_1 = require("mongoose");
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
        type: String,
        required: true
    },
    passwordToken: String,
    passwordResetExpiry: Date,
});
exports.Users = (0, mongoose_1.model)('User', userSchema);

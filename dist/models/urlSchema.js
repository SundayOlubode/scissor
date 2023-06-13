"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const urlSchema = new mongoose_1.Schema({
    longUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true
    },
    createdAt: {
        type: String,
        required: true
    },
    expiresAt: {
        type: String,
        required: true
    },
    userId: {
        type: String
    },
    count: {
        type: Number,
        required: true,
        default: 0
    },
});
const Urls = (0, mongoose_1.model)('url', urlSchema);
exports.default = Urls;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Urls = void 0;
const mongoose_1 = require("mongoose");
const urlSchema = new mongoose_1.Schema({
    longUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Number,
        required: true
    },
    expiresAt: {
        type: Number,
        required: true
    },
    userId: {
        type: String
    },
    isCustom: {
        type: Boolean,
        default: false
    },
    count: {
        type: Number,
        default: 0
    },
});
exports.Urls = (0, mongoose_1.model)('url', urlSchema);

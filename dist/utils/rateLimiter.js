"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Rate Limiter
 * Limits each User(or IP) to 30 requests per 2 mins
 */
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 2 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests!',
    skipFailedRequests: true,
    keyGenerator: (req, res) => {
        return req.user || req.ip;
    }
});
exports.default = limiter;

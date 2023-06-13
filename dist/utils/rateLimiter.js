"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Rate Limiter
 */
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 2 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests!',
    skipFailedRequests: true
});
exports.default = limiter;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPasswdResetToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const createPasswdResetToken = () => {
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    const passwordToken = crypto_1.default
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    const passwordResetExpiry = Date.now() + 10 * 60 * 1000;
    return { resetToken, passwordToken, passwordResetExpiry };
};
exports.createPasswdResetToken = createPasswdResetToken;

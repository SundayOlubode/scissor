"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class appError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, appError);
    }
}
exports.default = appError;

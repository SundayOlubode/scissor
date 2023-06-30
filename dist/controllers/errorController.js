"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const appError_1 = __importDefault(require("../utils/appError"));
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new appError_1.default(message, 400);
};
const handleDuplicateKeyDB = (err) => {
    const value = err.keyValue.name;
    logger_1.default.info(value);
    const message = `Duplicate field value: '${value}' Please use another value`;
    return new appError_1.default(message, 400);
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid field data ${errors.join(". ")} Critical Error`;
    return new appError_1.default(message, 400);
};
const handleJWTError = (err) => new appError_1.default("Invalid token. Please login again", 401);
const handleJWTExpiredError = (err) => new appError_1.default("Your token is expired, Please login again", 401);
const sendErrorDev = (err, res) => {
    logger_1.default.error(err);
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
const sendErrorProd = (err, res) => {
    //OPerational Error that we trust, send to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        //Programming Errors or other unknown Error: Don't leak error details
    }
    else {
        console.error("ERROR 💣", err);
        return res.status(500).json({
            status: "error",
            message: "Something went very wrong. Please try again",
        });
    }
};
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === "development") {
        return sendErrorDev(err, res);
    }
    else if (process.env.NODE_ENV === "production") {
        logger_1.default.error(err);
        let error = Object.assign({}, err);
        error.message = err.message;
        if (error.name === "CastError")
            error = handleCastErrorDB(error);
        if (error.code === 11000)
            error = handleDuplicateKeyDB(error);
        if (error._message === "Validation failed")
            error = handleValidationErrorDB(error);
        if (error.name === "JsonWebTokenError")
            error = handleJWTError(error);
        if (error.name === "TokenExpiredError")
            error = handleJWTExpiredError(error);
        return sendErrorProd(error, res);
    }
    return res.status(500).json({
        status: "error",
        message: "Something went wrong",
    });
};
exports.default = errorHandler;

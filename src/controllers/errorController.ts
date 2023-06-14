import { NextFunction, Request, Response } from "express";

import logger from "../utils/logger";
import AppError from "../utils/appError";


interface CustomError extends Error {
    status: string,
    statusCode: number,
    path: string,
    value: any,
    keyValue: any,
    errors: any,
    isOperational: boolean,
    code: number,
    _message: string
}

type SendError = (err: CustomError, res: Response) => Response

const handleCastErrorDB = (err: CustomError): CustomError => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400) as CustomError;
};
const handleDuplicateKeyDB = (err: CustomError): CustomError => {
    const value = err.keyValue.name;
    logger.info(value);
    const message = `Duplicate field value: '${value}' Please use another value`;
    return new AppError(message, 400) as CustomError;
};
const handleValidationErrorDB = (err: CustomError): CustomError => {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid field data ${errors.join(". ")} Critical Error`;
    return new AppError(message, 400) as CustomError;
};

const handleJWTError = (err: CustomError): CustomError =>
    new AppError("Invalid token. Please login again", 401) as CustomError;

const handleJWTExpiredError = (err: CustomError): CustomError =>
    new AppError("Your token is expired, Please login again", 401) as CustomError;


const sendErrorDev: SendError = (err: CustomError, res: Response) => {
    logger.error(err);
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd: SendError = (err: CustomError, res: Response) => {
    //OPerational Error that we trust, send to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        //Programming Errors or other unknown Error: Don't leak error details
    } else {
        console.error("ERROR 💣", err);
        return res.status(500).json({
            status: "error",
            message: "Something went very wrong. Please try again",
        });
    }
};

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): Response => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        return sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === "production") {
        logger.error(err);
        let error = { ...err };
        error.message = err.message;
        if (error.name === "CastError") error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateKeyDB(error);
        if (error._message === "Validation failed")
            error = handleValidationErrorDB(error);
        if (error.name === "JsonWebTokenError") error = handleJWTError(error);
        if (error.name === "TokenExpiredError")
            error = handleJWTExpiredError(error);
        return sendErrorProd(error, res);
    }

    return res.status(500).json({
        status: "error",
        message: "Something went wrong",
    });
};

export default errorHandler
import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import appError from "../utils/appError";


interface IError extends Error {
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


type SendError = (err: IError, res: Response) => Response

const handleCastErrorDB = (err: IError): IError => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new appError(message, 400) as IError;
};
const handleDuplicateKeyDB = (err: IError): IError => {
    const value = err.keyValue.name;
    logger.info(value);
    const message = `Duplicate field value: '${value}' Please use another value`;
    return new appError(message, 400) as IError;
};
const handleValidationErrorDB = (err: IError): IError => {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid field data ${errors.join(". ")} Critical Error`;
    return new appError(message, 400) as IError;
};

const handleJWTError = (err: IError): IError =>
    new appError("Invalid token. Please login again", 401) as IError;

const handleJWTExpiredError = (err: IError): IError =>
    new appError("Your token is expired, Please login again", 401) as IError;


const sendErrorDev: SendError = (err: IError, res: Response) => {
    logger.error(err);
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd: SendError = (err: IError, res: Response) => {
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

const errorHandler = (err: IError, req: Request, res: Response, next: NextFunction): Response => {
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
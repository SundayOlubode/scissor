"use strict";
// import jest from 'jest'
// import {Response, Request, NextFunction} from 'express'
// import AppError from '../../src/utils/appError';
// import errorHandler from '../../src/controllers/errorController';
// interface CustomError extends Error {
//     status: string,
//     statusCode: number,
//     path: string,
//     value: any,
//     keyValue: any,
//     errors: any,
//     isOperational: boolean,
//     code: number,
//     _message: string
// }
// // Tests that the function returns the expected response in development environment with a valid error object
// it("test_happy_path_dev", () => {
//     const err = new AppError("Test error", 400) as CustomError;
//     const req = {} as Request;
//     const res = {} as Response;
//     const next = jest.fn() as NextFunction;
//     const result = errorHandler(err, req, res, next);
//     expect(result.status).toBe(400);
//     expect(result.json).toHaveBeenCalledWith({
//         status: "error",
//         error: err,
//         message: "Test error",
//         stack: err.stack,
//     });
// });
// // Tests that the function returns the expected response in production environment with a valid error object
// it("test_happy_path_prod", () => {
//     process.env.NODE_ENV = "production";
//     const err = new AppError("Test error", 400);
//     const req = {} as Request;
//     const res = {} as Response;
//     const next = jest.fn() as NextFunction;
//     const result = errorHandler(err, req, res, next);
//     expect(result.status).toBe(400);
//     expect(result.json).toHaveBeenCalledWith({
//         status: "error",
//         message: "Test error",
//     });
// });
// // Tests that the function sets the status to 'error' when the error object has no status property
// it("test_edge_case_no_status", () => {
//     const err = new AppError("Test error", 400) as CustomError;
//     // delete err.status;
//     const req = {} as Request;
//     const res = {} as Response;
//     const next = jest.fn() as NextFunction;
//     const result = errorHandler(err, req, res, next);
//     expect(result.status).toBe(400);
//     expect(result.json).toHaveBeenCalledWith({
//         status: "error",
//         error: err,
//         message: "Test error",
//         stack: err.stack,
//     });
// });
// // Tests that the function sets the status code to 500 when the error object has no status code property
// it("test_edge_case_no_status_code", () => {
//     const err = new AppError("Test error");
//     delete err.statusCode;
//     const req = {} as Request;
//     const res = {} as Response;
//     const next = jest.fn() as NextFunction;
//     const result = errorHandler(err, req, res, next);
//     expect(result.status).toBe(500);
//     expect(result.json).toHaveBeenCalledWith({
//         status: "error",
//         error: err,
//         message: "Test error",
//         stack: err.stack,
//     });
// });
// // Tests that the function returns a 500 status code when NODE_ENV is not set
// it("test_edge_case_no_env", () => {
//     process.env.NODE_ENV = "";
//     const err = new AppError("Test error", 400);
//     const req = {} as Request;
//     const res = {} as Response;
//     const next = jest.fn() as NextFunction;
//     const result = errorHandler(err, req, res, next);
//     expect(result.status).toBe(500);
//     expect(result.json).toHaveBeenCalledWith({
//         status: "error",
//         message: "Something went wrong",
//     });
// });
// // Tests that the function returns a 500 status code when the error object is not handled by any of the defined functions
// it("test_edge_case_unhandled_error", () => {
//     const err = new Error("Test error");
//     const req = {} as Request;
//     const res = {} as Response;
//     const next = jest.fn() as NextFunction;
//     const result = errorHandler(err, req, res, next);
//     expect(result.status).toBe(500);
//     expect(result.json).toHaveBeenCalledWith({
//         status: "error",
//         message: "Something went very wrong",
//     });
// });

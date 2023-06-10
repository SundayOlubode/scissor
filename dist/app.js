"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const httpLogger_1 = __importDefault(require("./utils/httpLogger"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(httpLogger_1.default);
app.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Success',
        data: 'Some data'
    });
});
exports.default = app;

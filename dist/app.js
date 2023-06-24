"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const httpLogger_1 = __importDefault(require("./utils/httpLogger"));
const rateLimiter_1 = __importDefault(require("./utils/rateLimiter"));
const errorController_1 = __importDefault(require("./controllers/errorController"));
const appError_1 = __importDefault(require("./utils/appError"));
const authRouter_1 = __importDefault(require("./routers/authRouter"));
const urlController_1 = __importDefault(require("./controllers/urlController"));
const location_1 = __importDefault(require("./middlewares/location"));
const userRouter_1 = __importDefault(require("./routers/userRouter"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(httpLogger_1.default);
app.use(rateLimiter_1.default);
app.get('/', (req, res, next) => {
    return res.status(200).json({
        message: 'Success',
        data: 'Welcome!!!'
    });
});
app.use('/api/v1/auth', authRouter_1.default);
app.use('/api/v1/user', userRouter_1.default);
app.get('/:shortUrl', location_1.default, urlController_1.default);
app.use('*', (req, res, next) => {
    return next(new appError_1.default(`${req.originalUrl} not found on this server`, 404));
});
app.use(errorController_1.default);
exports.default = app;

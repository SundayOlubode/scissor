"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./utils/logger"));
dotenv_1.default.config();
const PORT = process.env.PORT;
process.on('uncaughtException', (error) => {
    logger_1.default.info("UNCAUGHT EXCEPTION! 🔥 Shutting Down...");
    logger_1.default.info(error.name, error.message);
    process.exit(1);
});
const server = app_1.default.listen(PORT, () => {
    logger_1.default.info(`Server listening on port ${PORT}`);
});
process.on('unhandledRejection', (reason) => {
    logger_1.default.info("UNHANDLED REJECTION! 🔥 Shutting Down...");
    logger_1.default.info({ 'REASON': reason });
    server.close(() => {
        process.exit(1);
    });
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./utils/logger"));
const db_1 = __importDefault(require("./models/db"));
const redis_1 = __importDefault(require("./configs/redis"));
dotenv_1.default.config();
const PORT = process.env.PORT;
process.on('uncaughtException', (error) => {
    logger_1.default.error("UNCAUGHT EXCEPTION! 🔥 Shutting Down...");
    logger_1.default.error(error.name, error.message);
    process.exit(1);
});
const server = app_1.default.listen(PORT, () => {
    logger_1.default.info(`Server listening on port ${PORT}`);
    db_1.default.init();
    redis_1.default.connect();
});
process.on('unhandledRejection', (reason) => {
    logger_1.default.error("UNHANDLED REJECTION! 🔥 Shutting Down...");
    logger_1.default.error({ 'REASON': reason });
    server.close(() => {
        process.exit(1);
    });
});

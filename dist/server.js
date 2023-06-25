"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./utils/logger"));
const db_1 = __importDefault(require("./models/db"));
const urlController_1 = require("./controllers/urlController");
const urlSchema_1 = require("./models/urlSchema");
dotenv_1.default.config();
const PORT = process.env.PORT;
process.on('uncaughtException', (error) => {
    logger_1.default.error("UNCAUGHT EXCEPTION! 🔥 Shutting Down...");
    logger_1.default.error(error.name, error.message);
    process.exit(1);
});
urlController_1.event.on('inc-counter', (shortUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const Url = yield urlSchema_1.Urls.findOne({ shortUrl });
    if (Url) {
        let { count } = Url;
        count += 1;
        Url.count = count;
        yield Url.save();
    }
    return;
}));
const server = app_1.default.listen(PORT, () => {
    logger_1.default.info(`Server listening on port ${PORT}`);
    db_1.default.init();
    // Cache.connect()
});
process.on('unhandledRejection', (reason) => {
    logger_1.default.error("UNHANDLED REJECTION! 🔥 Shutting Down...");
    logger_1.default.error({ 'REASON': reason });
    server.close(() => {
        process.exit(1);
    });
});

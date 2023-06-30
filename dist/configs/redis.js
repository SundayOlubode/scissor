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
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../utils/logger"));
const appError_1 = __importDefault(require("../utils/appError"));
dotenv_1.default.config();
const REDIS_PORT = parseInt(process.env.REDIS_PORT);
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
class Cache {
    constructor() {
        this.client = (0, redis_1.createClient)({
            password: REDIS_PASSWORD,
            socket: {
                host: REDIS_HOST,
                port: REDIS_PORT
            }
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.connect();
            }
            catch (error) {
                logger_1.default.error(error.message);
                throw new appError_1.default(error.message, 500);
            }
        });
    }
}
const { client } = new Cache();
exports.default = client;

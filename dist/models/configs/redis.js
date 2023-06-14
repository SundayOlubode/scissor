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
const redis_1 = __importDefault(require("redis"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../../utils/logger"));
dotenv_1.default.config();
const REDIS_USERNAME = process.env.REDIS_USERNAME;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
class Cache {
    constructor() {
        this.redis = null;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.redis = yield redis_1.default.createClient({
                    url: `redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`
                });
                this.redis.connect();
                this.redis.on('connect', () => {
                    logger_1.default.info('Redis connected');
                });
                this.redis.on('error', () => {
                    logger_1.default.info('Redis connection error');
                });
            }
            catch (error) {
                logger_1.default.info(error);
            }
        });
    }
}
const instance = new Cache();
exports.default = instance;

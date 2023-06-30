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
exports.getHistory = void 0;
const appError_1 = __importDefault(require("../utils/appError"));
const urlSchema_1 = require("../models/urlSchema");
/**
 * Return User's Created Link History
 * @return Links
 */
const getHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Links = yield urlSchema_1.Urls.find({ userId: req.user });
        res.status(200).json({
            status: 'success',
            data: Links
        });
        return;
    }
    catch (error) {
        throw new appError_1.default(error.message, error.statusCode);
    }
});
exports.getHistory = getHistory;

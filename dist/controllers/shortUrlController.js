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
const appError_1 = __importDefault(require("../utils/appError"));
const urlSchema_1 = require("../models/urlSchema");
const redirection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { shortUrl } = req.params;
        shortUrl = `${req.protocol}://${req.get('host')}/${shortUrl}`;
        const Url = yield urlSchema_1.Urls.findOne({ shortUrl });
        if (!Url) {
            throw new appError_1.default('URL not found!', 404);
        }
        let { longUrl, count } = Url;
        count += 1;
        Url.count = count;
        yield Url.save();
        res.redirect(longUrl);
        return;
    }
    catch (error) {
        next(new appError_1.default(error.message, error.statusCode));
        return;
    }
});
exports.default = redirection;

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
const axios_1 = __importDefault(require("axios"));
const locationSchema_1 = require("../models/locationSchema");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const appError_1 = __importDefault(require("../utils/appError"));
const getLocation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.NODE_ENV === 'production') {
        const shortUrl = req.params.shortUrl;
        try {
            const Resp = yield axios_1.default.get(`http://api.ipapi.com/api/check?access_key=${process.env.IPAPI_KEY}`);
            const apiResp = yield Resp.data;
            const location = apiResp.country_name;
            const Location = yield locationSchema_1.Locations.findOne({ location });
            if (!Location) {
                yield locationSchema_1.Locations.create({
                    shortUrl,
                    location
                });
            }
            let count = Location.count;
            Location.count = count + 1;
            yield Location.save();
            // ADD LOCATION TO REQ OBJECT
            req.location = location;
        }
        catch (error) {
            next(new appError_1.default(error.message, error.statusCode));
            return;
        }
    }
    return next();
});
exports.default = getLocation;

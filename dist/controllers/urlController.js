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
exports.createUrl = void 0;
const appError_1 = __importDefault(require("../utils/appError"));
const urlSchema_1 = require("../models/urlSchema");
const url_1 = require("url");
const base62_1 = __importDefault(require("../utils/base62"));
const redis_1 = __importDefault(require("../configs/redis"));
/**
 * Create Short Url
 * @returns Response Body
 */
const createUrl = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET LONGURL
        const longUrl = req.body.longUrl;
        const isCustom = req.body.isCustom;
        const customUrl = req.body.customUrl;
        const shouldHaveQR = req.body.shouldHaveQR;
        // VERIFY URL
        const isValidUrl = verifyUrl(longUrl);
        // if (!isValidUrl) {
        //     throw new appError('Please provide a valid Url', 400)
        // }
        // CHECK DB TO SEE IF LONGURL EXISTS
        const oldLongUrl = yield urlSchema_1.Urls.findOne({ longUrl });
        if (oldLongUrl !== null) {
            const { shortUrl, userId, isCustom } = oldLongUrl;
            // IF IS NOT CUSTOM, AND USER NOT OWNER RETURN NEW SAME URL FOR USER 
            if (!isCustom && req.user !== userId) {
                const newUrlPayload = {
                    userId: req.user,
                    longUrl,
                    shortUrl,
                    createdAt: Date.now(),
                    expiresAt: Date.now() + (3600 * 24 * 30),
                    // ISSUE: HOW TO INCREMENT WHEN DURING CLICKS 
                    // TAKING FOR THE FACT THAT SHORTURL MAY BE MORE THAN ONE
                };
                const newUrl = yield urlSchema_1.Urls.create(newUrlPayload);
                return res.status(200).json({
                    status: 'success',
                    data: newUrl
                });
                // throw new appError('Url already created by you! Please check Url history!', 403)
            }
            const newUrl = oldLongUrl;
            // RETURN SHORTURL IF LONG URL EXISTS
            return res.status(200).json({
                status: 'success',
                data: newUrl
            });
        }
        var shortUrl;
        // CHECK IF IS CUSTOM URL
        if (isCustom) {
            shortUrl = yield createCustomUrl(customUrl, req);
            returnCreateResponse(longUrl, shortUrl, req, res, true);
        }
        // OTHERWISE:
        // CREATE SHORTURL ENCODING
        const enconding = (0, base62_1.default)(longUrl);
        // IF SHORT URL ALREADY EXISTS, CREATE NEW SHORTURL ENCODING
        shortUrl = `${req.protocol}://${req.get('host')}/${enconding}`;
        returnCreateResponse(longUrl, shortUrl, req, res);
    }
    catch (error) {
        next(new appError_1.default(error.message, error.statusCode));
        return;
    }
});
exports.createUrl = createUrl;
/**
 * Verify | Valid Url
 * @param inputUrl
 * @returns Boolean
 */
function verifyUrl(inputUrl) {
    try {
        // Parse the input URL
        const parsedUrl = new url_1.URL(inputUrl);
        // Check if the parsed URL has a valid protocol (e.g., http or https)
        if (!parsedUrl.protocol || !['http:', 'https:'].includes(parsedUrl.protocol)) {
            return false;
        }
        // Check if the parsed URL has a valid hostname
        if (!parsedUrl.hostname) {
            return false;
        }
        return true;
    }
    catch (error) {
        return false;
    }
}
/**
 * Creates Custom Url
 * @param customUrl
 * @param req
 * @returns String
 */
function createCustomUrl(customUrl, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const oldCustomUrl = yield urlSchema_1.Urls.findOne({ shortUrl: customUrl });
        // CHECK IF CUSTOM NAME EXISTS
        if (oldCustomUrl) {
            // IF EXIST: SEND ERROR TO USE ANOTHER CUSTOM NAME
            throw new appError_1.default('Link not available. Please provide new custom link', 401);
        }
        // CREATE CUSTOM URL
        const shortUrl = `${req.protocol}://${req.get('host')}/${customUrl}`;
        return shortUrl;
    });
}
/**
 * Sends Response to User
 * @returns Response
 */
function returnCreateResponse(longUrl, shortUrl, req, res, isCustom = false) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // SAVE LONG AND SHORT URL IN DB
            const newUrl = yield urlSchema_1.Urls.create({
                longUrl,
                shortUrl,
                createdAt: Date.now(),
                expiresAt: Date.now() + (3600 * 24 * 30),
                userId: req.user,
                isCustom
            });
            // SAVE IN CACHE LAYER
            const cacheKey = longUrl;
            const cacheValue = shortUrl;
            yield redis_1.default.set(cacheKey, cacheValue);
            return res.status(201).json({
                status: 'success',
                data: newUrl
            });
        }
        catch (error) {
            throw new appError_1.default(error.message, error.statusCode);
        }
    });
}

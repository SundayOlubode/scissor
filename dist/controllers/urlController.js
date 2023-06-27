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
exports.getUrlAnalytics = exports.editCusomUrl = exports.createUrl = exports.event = void 0;
const appError_1 = __importDefault(require("../utils/appError"));
const urlSchema_1 = require("../models/urlSchema");
const redis_1 = __importDefault(require("../configs/redis"));
const events_1 = __importDefault(require("events"));
const base62_1 = __importDefault(require("../utils/base62"));
const cloudinary_1 = __importDefault(require("../configs/cloudinary"));
const qrcode_1 = __importDefault(require("qrcode"));
const logger_1 = __importDefault(require("../utils/logger"));
const locationSchema_1 = require("../models/locationSchema");
const fs_1 = __importDefault(require("fs"));
exports.event = new events_1.default();
/**
 * Create Short Url
 * @returns Response
 */
const createUrl = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET LONGURL
        const longUrl = req.body.longUrl;
        const isCustom = req.body.isCustom;
        const customUrl = req.body.customUrl;
        const hasQR = req.body.hasQR;
        // VERIFY URL
        const isValidUrl = verifyUrl(longUrl);
        if (!isValidUrl) {
            throw new appError_1.default('Please enter a valid Url', 400);
        }
        // CHECK DB TO SEE IF LONGURL EXISTS
        const oldLongUrl = yield urlSchema_1.Urls.findOne({ longUrl });
        if (oldLongUrl) {
            const { shortUrl, userId, isCustom } = oldLongUrl;
            const oldUrlNotCustom = isCustom;
            let newUrl;
            // IF EXISTING URL IS NOT CUSTOM, AND USER NOT FIRST CREATOR, RETURN SAME URL FOR USER
            // WHY? CAN'T GENERATE DIFFERENT SHORTURL FOR ONE LONGURL - USER SHARES ANALYTICS
            if (req.user !== userId) {
                if (!oldUrlNotCustom) {
                    console.log('USER OLDURL');
                    const newUrlPayload = {
                        userId: req.user,
                        longUrl,
                        shortUrl,
                        createdAt: Date.now(),
                        expiresAt: Date.now() + (3600 * 24 * 30),
                    };
                    newUrl = yield urlSchema_1.Urls.create(newUrlPayload);
                    return res.status(201).json({
                        status: 'success',
                        message: 'Url created successfully',
                        data: newUrl
                    });
                }
            }
            // IF USER IS THE CREATOR
            newUrl = oldLongUrl;
            // RETURN SHORTURL IF LONG URL EXISTS
            return res.status(200).json({
                status: 'success',
                data: newUrl
            });
        }
        let shortUrl;
        // CHECK IF IS CUSTOM URL
        if (isCustom === true) {
            shortUrl = yield createCustomUrl(customUrl, req);
            return returnCreateResponse(longUrl, shortUrl, req, res, true);
        }
        // CREATE SHORTURL ENCODING
        let enconding = '';
        enconding = (0, base62_1.default)(longUrl);
        let oldShortUrl = yield urlSchema_1.Urls.findOne({ shortUrl: enconding });
        while (oldShortUrl !== null) {
            enconding = (0, base62_1.default)(longUrl);
            oldShortUrl = yield urlSchema_1.Urls.findOne({ shortUrl: enconding });
        }
        // IF SHORT URL ALREADY EXISTS, CREATE NEW SHORTURL ENCODING
        shortUrl = `${req.protocol}://${req.get('host')}/${enconding}`;
        return returnCreateResponse(longUrl, shortUrl, req, res);
    }
    catch (error) {
        next(new appError_1.default(error.message, error.statusCode));
        return;
    }
});
exports.createUrl = createUrl;
/**
 * Verify Url
 * @param inputUrl
 * @returns Boolean
 */
function verifyUrl(inputUrl) {
    try {
        // Parse the input URL
        const parsedUrl = new URL(inputUrl);
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
        if (!customUrl) {
            throw new appError_1.default('Please provide a custom link', 400);
        }
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
        let newUrl;
        try {
            // SAVE LONG AND SHORT URL IN DB
            newUrl = yield urlSchema_1.Urls.create({
                longUrl,
                shortUrl,
                createdAt: Date.now(),
                expiresAt: Date.now() + (3600 * 24 * 30),
                userId: req.user,
                isCustom
            });
            // ADD QR IF REQUESTED
            if (req.body.hasQR) {
                newUrl = yield generateQRCode(newUrl);
            }
            // SAVE IN CACHE LAYER
            yield redis_1.default.set(shortUrl, longUrl);
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
function generateQRCode(Url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // let QRPath = `${__dirname}/../QRs/${Url.shortUrl.slice(-7)}.png`
            let QRPath = `QRs/${Url.shortUrl.slice(-7)}.png`;
            let QRCodeUpload;
            let QRCodeLink;
            // GENERATE QR IMAGE
            qrcode_1.default.toFile(QRPath, Url.shortUrl, (error) => {
                if (error) {
                    logger_1.default.info(error);
                    throw new appError_1.default(error.message, error.statusCode);
                }
            });
            // SAVE IMAGE PATH TO CLOUD
            QRCodeUpload = yield cloudinary_1.default.uploader.upload(QRPath);
            QRCodeLink = QRCodeUpload.url;
            // REMOVE QR
            fs_1.default.unlink(QRPath, (err) => {
                if (err) {
                    logger_1.default.error('Error deleting the file:', err);
                }
            });
            // ADD CLOUD LINK TO DB
            Url.QRLink = QRCodeLink;
            Url.hasQR = true;
            yield Url.save();
            return Url;
        }
        catch (error) {
            throw new appError_1.default(error.message, error.statusCode);
        }
    });
}
const redirection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { shortUrl } = req.params;
        shortUrl = `${req.protocol}://${req.get('host')}/${shortUrl}`;
        // Check short url in Cache
        const urlInCache = yield redis_1.default.get(shortUrl);
        if (urlInCache) {
            setTimeout(() => {
                exports.event.emit('inc-counter', shortUrl);
            }, 2000);
            res.redirect(urlInCache);
            return;
        }
        const Url = yield urlSchema_1.Urls.findOne({ shortUrl });
        if (!Url) {
            throw new appError_1.default('URL not found!', 404);
        }
        let { longUrl, count } = Url;
        count += 1;
        Url.count = count;
        yield Url.save();
        // SAVE IN CACHE LAYER
        yield redis_1.default.set(shortUrl, longUrl);
        res.redirect(longUrl);
        return;
    }
    catch (error) {
        next(new appError_1.default(error.message, error.statusCode));
        return;
    }
});
const editCusomUrl = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shortUrl = req.body.shortUrl;
        const newCustomUrl = req.body.newCustomUrl;
        // CHECK IF THE CUSTOM URL EXISTS
        const currentUrl = yield urlSchema_1.Urls.findOne({ shortUrl, isCustom: true });
        if (!currentUrl) {
            throw new appError_1.default('Url not found!', 400);
        }
        const newUrl = `${req.protocol}://${req.get('host')}/${newCustomUrl}`;
        // CHECK IF THE NEW CUSTOM URL EXISTS
        const newCustomExists = yield urlSchema_1.Urls.findOne({ shortUrl: newUrl });
        if (newCustomExists) {
            throw new appError_1.default('Link not available. Please provide new custom link', 401);
        }
        // CHECK IF USER IS OWNER
        if (!(req.user === currentUrl.userId)) {
            throw new appError_1.default('Unauthorized!', 401);
        }
        currentUrl.shortUrl = newUrl;
        yield currentUrl.save();
        yield redis_1.default.set(newCustomUrl, currentUrl.longUrl);
        res.status(200).json({
            status: 'success',
            message: 'Custom Url changed successfully!',
            data: currentUrl
        });
        return;
    }
    catch (error) {
        next(new appError_1.default(error.message, error.statusCode));
        return;
    }
});
exports.editCusomUrl = editCusomUrl;
const getUrlAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET SHORTURL FROM BODY
        let { shortUrl } = req.body;
        shortUrl = `${req.protocol}://${req.get('host')}/${shortUrl}`;
        // GET URL FROM DB
        const Url = yield urlSchema_1.Urls.findOne({ shortUrl });
        // SET TOTALCLICKS TO URL COUNTS
        let totalClicks;
        if (Url) {
            totalClicks = Url.count;
        }
        totalClicks = 0;
        // GET LOCATIONS OF SHORTURL
        let Location;
        Location = yield locationSchema_1.Locations.find({ shortUrl });
        // RETURN LOCATION PLUS TOTAL CLICKS
        res.status(200).json({
            status: 'success',
            data: {
                totalClicks,
                Locations: Location
            }
        });
        return;
    }
    catch (error) {
        next(new appError_1.default(error.message, error.statusCode));
        return;
    }
});
exports.getUrlAnalytics = getUrlAnalytics;
exports.default = redirection;

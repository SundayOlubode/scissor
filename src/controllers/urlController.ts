import { Response, Request, NextFunction, RequestHandler } from "express"
import appError from "../utils/appError"
import { Urls, IUrl } from "../models/urlSchema"
import Cache from "../configs/redis"
import EventEmitter from 'events'
import convertToBase62 from '../utils/base62'
import cloudinary from "../configs/cloudinary"
import QRCode from 'qrcode'
import logger from "../utils/logger"
import { UploadApiResponse } from "cloudinary"
import { ILocation, Locations } from "../models/locationSchema"
import fs from "fs"

interface ReqParams {
    shortUrl?: string
}

export const event = new EventEmitter()

/**
 * Create Short Url
 * @returns Response
 */
export const createUrl = async (req: Request, res: Response, next: NextFunction):
    Promise<Response<any, Record<string, any>> | Error | undefined> => {
    try {
        // GET LONGURL
        const longUrl: string = req.body.longUrl
        const isCustom: boolean = req.body.isCustom
        const customUrl: string = req.body.customUrl
        const hasQR: boolean = req.body.hasQR

        // VERIFY URL
        const isValidUrl = verifyUrl(longUrl)
        if (!isValidUrl) {
            throw new appError('Please enter a valid Url', 400)
        }

        // CHECK DB TO SEE IF LONGURL EXISTS
        const oldLongUrl: IUrl | null = await Urls.findOne({ longUrl })

        if (oldLongUrl) {

            const { shortUrl, userId, isCustom } = oldLongUrl

            const oldUrlNotCustom = isCustom

            let newUrl: IUrl
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

                    }

                    newUrl = await Urls.create(newUrlPayload)

                    return res.status(201).json({
                        status: 'success',
                        message: 'Url created successfully',
                        data: newUrl
                    })
                }
            }

            // IF USER IS THE CREATOR
            newUrl = oldLongUrl

            // RETURN SHORTURL IF LONG URL EXISTS
            return res.status(200).json({
                status: 'success',
                data: newUrl
            })
        }

        let shortUrl: string;

        // CHECK IF IS CUSTOM URL
        if (isCustom === true) {
            shortUrl = await createCustomUrl(customUrl, req)!
            return returnCreateResponse(longUrl, shortUrl, req, res, true)
        }

        // CREATE SHORTURL ENCODING
        let enconding = ''
        enconding = convertToBase62(longUrl)

        let oldShortUrl: IUrl | null = await Urls.findOne({ shortUrl: enconding })
        while (oldShortUrl !== null) {
            enconding = convertToBase62(longUrl)
            oldShortUrl = await Urls.findOne({ shortUrl: enconding })
        }

        // IF SHORT URL ALREADY EXISTS, CREATE NEW SHORTURL ENCODING
        shortUrl = `${req.protocol}://${req.get('host')}/${enconding}`
        return returnCreateResponse(longUrl, shortUrl, req, res)
    } catch (error: any) {
        next(new appError(error.message, error.statusCode));
        return;
    }
}

/**
 * Verify Url
 * @param inputUrl 
 * @returns Boolean
 */
function verifyUrl(inputUrl: string): boolean {
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

    } catch (error: any) {
        return false;
    }
}

/**
 * Creates Custom Url
 * @param customUrl 
 * @param req 
 * @returns String
 */
async function createCustomUrl(customUrl: string, req: Request):
    Promise<string | never> {

    if (!customUrl) {
        throw new appError('Please provide a custom link', 400)
    }

    const oldCustomUrl: IUrl | null = await Urls.findOne({ shortUrl: customUrl })

    // CHECK IF CUSTOM NAME EXISTS
    if (oldCustomUrl) {
        // IF EXIST: SEND ERROR TO USE ANOTHER CUSTOM NAME
        throw new appError('Link not available. Please provide new custom link', 401)
    }

    // CREATE CUSTOM URL
    const shortUrl = `${req.protocol}://${req.get('host')}/${customUrl}`
    return shortUrl;
}

/**
 * Sends Response to User
 * @returns Response
 */
async function returnCreateResponse(longUrl: string, shortUrl: string, req: Request, res: Response, isCustom: boolean = false):
    Promise<Response<any, Record<string, any>> | Error | undefined> {
    let newUrl: IUrl
    try {
        // SAVE LONG AND SHORT URL IN DB
        newUrl = await Urls.create({
            longUrl,
            shortUrl,
            createdAt: Date.now(),
            expiresAt: Date.now() + (3600 * 24 * 30), //30days validity
            userId: req.user,
            isCustom
        })

        // ADD QR IF REQUESTED
        if (req.body.hasQR) {
            newUrl = await generateQRCode(newUrl)
        }

        // SAVE IN CACHE LAYER
        await Cache.set(shortUrl, longUrl)

        return res.status(201).json({
            status: 'success',
            data: newUrl
        })
    } catch (error: any) {
        throw new appError(error.message, error.statusCode)
    }
}

async function generateQRCode(Url: IUrl):
    Promise<IUrl> {
    try {
        let QRPath = `QRImages/${Url.shortUrl.slice(-7)}.png`
        let QRCodeUpload: UploadApiResponse
        let QRCodeLink: string

        // GENERATE QR IMAGE
        QRCode.toFile(QRPath, Url.shortUrl, (error: any) => {
            if (error) {
                logger.info(error)
                throw new appError(error.message, error.statusCode)
            }
        })

        // SAVE IMAGE PATH TO CLOUD
        QRCodeUpload = await cloudinary.uploader.upload(QRPath)
        QRCodeLink = QRCodeUpload.url

        // REMOVE QR
        fs.unlink(QRPath, (err) => {
            if (err) {
                logger.error('Error deleting the file:', err);
            }
        });

        // ADD CLOUD LINK TO DB
        Url.QRLink = QRCodeLink
        Url.hasQR = true
        await Url.save()
        return Url;

    } catch (error: any) {
        throw new appError(error.message, error.statusCode);
    }
}

const redirection = async (req: Request, res: Response, next: NextFunction):
    Promise<Response<any, Record<string, any>> | Error | undefined> => {
    try {

        let { shortUrl }: ReqParams = req.params

        shortUrl = `${req.protocol}://${req.get('host')}/${shortUrl}`

        // Check short url in Cache
        const urlInCache = await Cache.get(shortUrl)

        if (urlInCache) {
            setTimeout(() => {
                event.emit('inc-counter', shortUrl)
            }, 2000)

            res.redirect(urlInCache);
            return;
        }

        const Url: IUrl | null = await Urls.findOne({ shortUrl })

        if (!Url) {
            throw new appError('URL not found!', 404)
        }

        let { longUrl, count }: IUrl = Url!
        count! += 1

        Url.count = count
        await Url.save()

        // SAVE IN CACHE LAYER
        await Cache.set(shortUrl, longUrl)

        res.redirect(longUrl);
        return;

    } catch (error: any) {
        next(new appError(error.message, error.statusCode))
        return;
    }
}

export const editCusomUrl = async (req: Request, res: Response, next: NextFunction):
    Promise<Response<any, Record<string, any>> | Error | undefined> => {
    try {
        const shortUrl = req.body.shortUrl
        const newCustomUrl = req.body.newCustomUrl

        // CHECK IF THE CUSTOM URL EXISTS
        const currentUrl: IUrl | null = await Urls.findOne({ shortUrl, isCustom: true })
        if (!currentUrl) {
            throw new appError('Url not found!', 400)
        }

        const newUrl = `${req.protocol}://${req.get('host')}/${newCustomUrl}`

        // CHECK IF THE NEW CUSTOM URL EXISTS
        const newCustomExists: IUrl | null = await Urls.findOne({ shortUrl: newUrl })
        if (newCustomExists) {
            throw new appError('Link not available. Please provide new custom link', 401)
        }

        // CHECK IF USER IS OWNER
        if (!(req.user === currentUrl.userId)) {
            throw new appError('Unauthorized!', 401)
        }

        currentUrl.shortUrl = newUrl
        await currentUrl.save()

        await Cache.set(newCustomUrl, currentUrl.longUrl)

        res.status(200).json({
            status: 'success',
            message: 'Custom Url changed successfully!',
            data: currentUrl
        })
        return;
    } catch (error: any) {
        next(new appError(error.message, error.statusCode))
        return;
    }
}

export const getUrlAnalytics = async (req: Request, res: Response, next: NextFunction):
    Promise<Response<any, Record<string, any>> | Error | undefined> => {

    try {

        // GET SHORTURL FROM BODY
        let { shortUrl } = req.body
        // shortUrl = `${req.protocol}://${req.get('host')}/${shortUrl}`

        // GET URL FROM DB
        const Url: IUrl | null = await Urls.findOne({ shortUrl })

        // SET TOTALCLICKS TO URL COUNTS
        let totalClicks: number;
        if (Url) {
            totalClicks = Url.count!
        }
        totalClicks = 0

        // GET LOCATIONS OF SHORTURL
        let Location: ILocation[] | null
        Location = await Locations.find({ shortUrl })

        // RETURN LOCATION PLUS TOTAL CLICKS
        res.status(200).json({
            status: 'success',
            data: {
                totalClicks,
                locations: Location
            }
        })
        return
    } catch (error: any) {
        next(new appError(error.message, error.statusCode))
        return;
    }
}

export default redirection
import { Response, Request, NextFunction, RequestHandler } from "express"
import appError from "../utils/appError"
import { Urls, IUrl } from "../models/urlSchema"
import { Users, IUser } from "../models/userSchema"
import { URL } from 'url'
import convertToBase62 from "../utils/base62"
import Cache from "../configs/redis"



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
        const shouldHaveQR: boolean = req.body.shouldHaveQR

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
                        // ISSUE: HOW TO INCREMENT WHEN DURING CLICKS 
                        // TAKING FOR THE FACT THAT SHORTURL MAY BE MORE THAN ONE
                        // TODO: READ UP MANY-TO-MANY RELATIONSSHIP
                    }

                    newUrl = await Urls.create(newUrlPayload)

                    return res.status(201).json({
                        status: 'success',
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
    try {
        // SAVE LONG AND SHORT URL IN DB
        const newUrl: IUrl = await Urls.create({
            longUrl,
            shortUrl,
            createdAt: Date.now(),
            expiresAt: Date.now() + (3600 * 24 * 30), //30days validity
            userId: req.user,
            isCustom
        })

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
import { Response, Request, NextFunction } from "express"
import appError from "../utils/appError"
import { Urls, IUser } from "../models/urlSchema"
import Users from "../models/userSchema"
import { URL } from 'url'
import convertToBase62 from "../utils/base62"

interface ReqBody extends Request {
    user: string
}

/**
 * Create Short Url
 * @param req 
 * @param res 
 * @param next 
 * @returns Response Body
 */
export const createUrl = async (req: ReqBody, res: Response, next: NextFunction):
    Promise<Response<any, Record<string, any>> | Error | undefined> => {
    try {
        // GET LONGURL
        const longUrl: string = req.body.longUrl
        const isCustom: boolean = req.body.isCustom
        const customUrl: string = req.body.customUrl
        const shouldHaveQR: boolean = req.body.shouldHaveQR

        // VERIFY URL
        const isValidUrl = verifyUrl(longUrl)
        // if (!isValidUrl) {
        //     throw new appError('Please provide a valid Url', 400)
        // }

        // CHECK DB TO SEE IF LONGURL EXISTS
        const oldLongUrl: IUser | null = await Urls.findOne({ longUrl })

        if (oldLongUrl !== null) {

            const { shortUrl, userId, isCustom } = oldLongUrl

            // IF IS NOT CUSTOM, AND USER NOT OWNER RETURN NEW SAME URL FOR USER 
            if (!isCustom && req.user !== userId) {
                const newUrlPayload: IUser = {
                    userId: req.user,
                    longUrl,
                    shortUrl,
                    createdAt: Date.now(),
                    expiresAt: Date.now() + (3600 * 24 * 30),
                    // ISSUE: HOW TO INCREMENT WHEN DURING CLICKS 
                    //TAKING FOR THE FACT THAT SHORTURL MAY BE MORE THAN ONE
                }

                const newUrl: IUser = await Urls.create(newUrlPayload)

                return res.status(200).json({
                    status: 'success',
                    data: newUrl
                })
                // throw new appError('Url already created by you! Please check Url history!', 403)
            }

            const newUrl = oldLongUrl
            // RETURN SHORTURL IF LONG URL EXISTS
            return res.status(200).json({
                status: 'success',
                data: newUrl
            })
        }

        var shortUrl: string;

        // CHECK IF IS CUSTOM URL
        if (isCustom) {
            shortUrl = await createCustomUrl(customUrl, req)!
            returnCreateResponse(longUrl, shortUrl, req, res, true)
        }

        // OTHERWISE:
        // CREATE SHORTURL ENCODING
        const enconding = convertToBase62(longUrl)

        // IF SHORT URL ALREADY EXISTS, CREATE NEW SHORTURL ENCODING
        shortUrl = `${req.protocol}://${req.get('host')}/${enconding}`
        returnCreateResponse(longUrl, shortUrl, req, res)
    } catch (error: any) {
        next(new appError(error.message, error.statusCode));
        return;
    }
}


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

async function createCustomUrl(customUrl: string, req: ReqBody):
    Promise<string | never> {
    const oldCustomUrl: IUser | null = await Urls.findOne({ shortUrl: customUrl })

    // CHECK IF CUSTOM NAME EXISTS
    if (oldCustomUrl) {
        // IF EXIST: SEND ERROR TO USE ANOTHER CUSTOM NAME
        throw new appError('Link not available. Please provide new custom link', 401)
    }

    // CREATE CUSTOM URL
    const shortUrl = `${req.protocol}://${req.get('host')}/${customUrl}`
    return shortUrl;
}

async function returnCreateResponse(longUrl: string, shortUrl: string, req: ReqBody, res: Response, isCustom: boolean = false):
    Promise<Response<any, Record<string, any>> | Error | undefined> {

    // SAVE LONG AND SHORT URL IN DB
    const newUrl: IUser = await Urls.create({
        longUrl,
        shortUrl,
        createdAt: Date.now(),
        expiresAt: Date.now() + (3600 * 24 * 30), //30days validity
        userId: req.user,
        isCustom
    })
    
    // SAVE IN CACHE LAYER

    return res.status(201).json({
        status: 'success',
        data: newUrl
    })

}
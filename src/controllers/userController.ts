import { Response, Request, NextFunction, RequestHandler } from "express"
import appError from "../utils/appError"
import { Urls, IUrl } from "../models/urlSchema"
import { Users, IUser } from "../models/userSchema"
import { URL } from 'url'
import convertToBase62 from "../utils/base62"
import Cache from "../configs/redis"




/**
 * Return User's Created Link History
 * @return Links
 */
export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Links = await Urls.find({ userId: req.user })

        res.status(200).json({
            status: 'success',
            data: Links
        })
        return;

    } catch (error: any) {
        throw new appError(error.message, error.statusCode)

    }
}
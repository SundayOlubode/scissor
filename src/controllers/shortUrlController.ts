import { Response, Request, NextFunction, RequestHandler } from "express"
import appError from "../utils/appError"
import { Urls, IUrl } from "../models/urlSchema"
import Cache from "../configs/redis"
import cron from 'node-cron'
import EventEmitter from 'events'
export const event = new EventEmitter()

interface ReqParams {
    shortUrl?: string
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
            }, 2000 )

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


export default redirection
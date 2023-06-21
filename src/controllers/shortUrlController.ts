import { Response, Request, NextFunction, RequestHandler } from "express"
import appError from "../utils/appError"
import { Urls, IUrl } from "../models/urlSchema"

interface ReqParams {
    shortUrl?: string
}

const redirection = async (req: Request, res: Response, next: NextFunction):
    Promise<Response<any, Record<string, any>> | Error | undefined> => {
    try {

        let { shortUrl }: ReqParams = req.params

        shortUrl = `${req.protocol}://${req.get('host')}/${shortUrl}`
        const Url: IUrl | null = await Urls.findOne({ shortUrl })

        if (!Url) {
            throw new appError('URL not found!', 404)
        }

        let { longUrl, count }: IUrl = Url!
        count! += 1

        Url.count = count
        await Url.save()

        res.redirect(longUrl);
        return;

    } catch (error: any) {
        next(new appError(error.message, error.statusCode))
        return;
    }
} 


export default redirection
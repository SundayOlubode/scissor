import axios from 'axios';
import { Locations, ILocation } from '../models/locationSchema';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv'
dotenv.config()
import appError from '../utils/appError';

const getLocation = async (req: Request, res: Response, next: NextFunction) => {

    if (process.env.NODE_ENV === 'production') {

        const shortUrl: string = req.params.shortUrl

        try {

            const Resp = await axios.get(`http://api.ipapi.com/api/check?access_key=${process.env.IPAPI_KEY!}`)
            const apiResp: any = await Resp.data
            const location: string = apiResp.country_name

            const Location: ILocation | null = await Locations.findOne({ location })

            if (!Location) {
                await Locations.create({
                    shortUrl,
                    location
                })
            }

            let count = Location!.count
            Location!.count = count + 1
            await Location!.save()

            // ADD LOCATION TO REQ OBJECT
            req.location = location
        } catch (error: any) {
            next(new appError(error.message, error.statusCode));
            return;
        }
    }

    return next()
}

export default getLocation
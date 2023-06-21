import axios from 'axios';
import { Locations, ILocation } from '../models/locationSchema';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv'
dotenv.config()

const getLocation = async (req: Request, res: Response, next: NextFunction) => {

    const shortUrl: string = req.params.shortUrl

    if (process.env.NODE_ENV === 'production') {

        const Resp = await axios.get(`http://api.ipapi.com/api/check?access_key=${process.env.IPAPI_KEY!}`)
        const apiResp: any = await Resp.data
        const location: string = apiResp.country_name

        await Locations.create({
            shortUrl,
            location
        })

        // ADD LOCATION TO REQ OBJECT
        req.location = location
    }

    return next()
}

export default getLocation
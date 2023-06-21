import { Request, Response, NextFunction, RequestHandler } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken';
import appError from "../utils/appError";
import dotenv from 'dotenv'
dotenv.config()
import { Users } from "../models/userSchema";
import logger from '../utils/logger';

/**
 * Check User Authorization
 * @returns void
 */
const authorize = async (req: Request, res: Response, next: NextFunction): Promise<unknown> => {

    try {

        let token;
        if (process.env.NODE_ENV === "development") {
            const authHeader = req.headers.authorization;
            if (!authHeader)
                throw new appError("You are not logged in, Please Login Again", 403);

            //Save token from authHeader if available
            token = authHeader.split(" ")[1];
        } else if (process.env.NODE_ENV === "production") {
            const cookieValue = req.cookies.jwt;
            if (!cookieValue)
                throw new appError("You are not logged in, Please Login Again", 403);

            //SAVE TOKEN FROM COOKIE
            token = req.cookies.jwt;
        }

        // verify token
        const verifiedToken: JwtPayload = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        //Check if Users exists
        const currentUser = await Users.findById(verifiedToken.user_id)

        if (!currentUser)
            throw new appError("Account Not Found, Please Login again!", 401);

        //Add Users to req object
        req.user = currentUser._id;
        next();
    } catch (error: any) {
        logger.error(error)
        next(new appError(error.message, error.statusCode));
        return;
    }
};

export default authorize;

import { IReqBody } from "../controllers/urlController";
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken';
import appError from "../utils/appError";
import { promisify } from "util";
import dotenv from 'dotenv'
dotenv.config()
import { Users } from "../models/userSchema";

/**
 * Check User Authorization
 * @returns void
 */
const authorize = async (req: IReqBody, res: Response, next: NextFunction): Promise<unknown> => {
    try {
        /** testing authorization**/
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
        const verifiedToken: any = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        );

        //Check if Users exists
        const currentUser = await Users.findById(verifiedToken.user_id)

        if (!currentUser)
            throw new appError("Account Not Found, Please Login again!", 401);

        //Add Users to req object
        req.user = currentUser._id;
        next();
    } catch (error: any) {
        return next(new appError(error.message, error.statusCode))
    }
};

export default authorize;

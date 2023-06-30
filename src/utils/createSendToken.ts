import { Response } from "express";
import { IUser } from "../models/userSchema";

interface typeCookieOptions {
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: boolean | "lax" | "strict" | "none" | undefined
}

/**
 * CREATE FUNCTION THAT HANDLES TOKEN RESPONSE & COOKIE RESPONSE
 */
const createSendToken = async (user: IUser, statusCode: number, res: Response):
    Promise<Response> => {
        
    const token = await user.createJwt();
    const cookieOptions: typeCookieOptions = {
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "none",
    };

    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res.cookie("jwt", token, cookieOptions);

    user.password = undefined

    return res.status(statusCode).json({
        status: "success",
        data: {
            user,
            token,
        },
    });
};

export default createSendToken;
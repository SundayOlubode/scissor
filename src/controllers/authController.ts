import { createPasswdResetToken } from "../utils/tokens"
import createSendToken from "../utils/createSendToken"
import { Users, IUser } from "../models/userSchema"
import { Request, Response, NextFunction, CookieOptions } from "express"
import appError from "../utils/appError"
import Email from "../utils/emails"
import crypto from 'crypto'
require('dotenv').config()

interface IReqBody {
    email: string;
    password?: string;
    username: string;
}

/**
 * SIGNUP
 * @returns Response
 */
export const signup = async (req: Request, res: Response, next: NextFunction):
    Promise<Response<any, Record<string, any>> | Error | undefined> => {

        const { email, password, username }: IReqBody = req.body

    try {

        if (!(email && password && username)) {
            throw new appError('Please provide full sign up details', 401)
        }

        const oldUser: IUser | null = await Users.findOne({ email })
        if (oldUser) throw new appError("User already exists. Please login", 409);

        const user: IUser | null = await Users.create(req.body)

        createSendToken(user, 201, res)

    } catch (error: any) {
        next(new appError(error.message, error.statusCode));
        return;
    }
}

/**
 * LOGIN
 * @returns Response
 */
export const login = async (req: Request, res: Response, next: NextFunction):
    Promise<Response<any, Record<string, any>> | Error | undefined> => {

    const { email, password }: IReqBody = req.body

    try {
        if (!(email || password)) {
            throw new appError('Please provide login details', 400)
        }

        const user: IUser | null = await Users.findOne({ email })

        // CHECK IF USER EXISTS WITHOUT LEAKING EXTRA INFOS
        if (!user || !(await user.isValidPassword(password!))) {
            throw new appError('Email or Password incorrect', 401)
        }

        createSendToken(user, 200, res)

    } catch (error: any) {
        next(new appError(error.message, error.statusCode));
        return;
    }
}

/**
 * FORGOT PASSWORD
 * @returns Response
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction):
    Promise<Response<any, Record<string, any>> | Error | undefined> => {

    const { email }: IReqBody = req.body

    try {

        const user = await Users.findOne({ email });
        if (!user) throw new appError("No User with that email", 401);

        const { resetToken, passwordToken, passwordResetExpiry } = createPasswdResetToken()

        user.passwordToken = passwordToken;
        user.passwordResetExpiry = passwordResetExpiry;

        await user.save()

        const resetUrl = `${req.protocol}://${req.get(
            "host"
        )}/api/v1/auth/resetpassword/${resetToken}`;

        // if (process.env.NODE_ENV === 'production') {
            await new Email(user, resetUrl).sendPasswordReset();
        // }

        // SEND RESPONSE
        res.status(200).json({
            status: "success",
            message: `Token sent to mail ${resetUrl}`,
        });

    } catch (error: any) {
        next(new appError(error.message, error.statusCode));
        return;
    }

}

/**
 * RESET PASSWORD
 * @returns Response
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction):
    Promise<Response<any, Record<string, any>> | Error | undefined> => {

    // CREATE A HASHED TOKEN FROM THE REQ PARAMS
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    try {

        const user: IUser | null = await Users.findOne({
            passwordToken: hashedToken,
            passwordResetExpiry: { $gte: Date.now() }
        })

        if (!user) throw new appError('Expired or Invalid Token! Please try again', 403)

        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;

        if (password !== confirmPassword) {
            throw new appError('Password and ConfirmPassword must be same', 403)
        }

        user.password = password;
        user.passwordToken = null;
        user.passwordResetExpiry = null;

        await user.save();

        const url = `${req.protocol}://${req.get("host")}/api/v1/auth/login`;

        // if (process.env.NODE_ENV === 'production') {
            await new Email(user, url).sendVerifiedPSWD();
        // }

        // LOG IN USER AND SEND JWT
        createSendToken(user, 200, res);

    } catch (error: any) {
        next(new appError(error.message, error.statusCode));
        return;
    }
}

const redirectURL = 'http://localhost:3000'

/**
 * Social Auth Controller
 */
export const socialAuth = (req: Request, res: Response, next: NextFunction) => {

    // OBTAIN USER DETAILS FROM SESSION
    const {
        user: { user, token, oldUser }
    } = req.session.passport;    

    const cookieOptions: CookieOptions = {
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    // Send token to client
    res.cookie("jwt", token, cookieOptions);

    res.redirect('/')

}

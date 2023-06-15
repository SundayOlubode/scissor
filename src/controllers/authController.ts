import appError from "../utils/appError"
import { Users, IUser } from "../models/userSchema"
const { createSendToken } = require('../utils/createSendToken')
import { createPasswdResetToken } from "../utils/tokens"
const { EmailToUsers } = require('../utils/emails')
require('dotenv').config()
const crypto = require('crypto')
import { Request, Response, NextFunction } from "express"
import { IReqBody } from "./urlController"


export const signup = async (req: IReqBody, res: Response, next: NextFunction) => {

    const { email, password, firstname, lastname, role, adminCode } = req.body

    try {

        if (!(email && password && firstname && lastname)) {
            throw new appError('Please provide full sign up details', 401)
        }

        const oldUser = await Users.findOne({ email })
        if (oldUser) throw new appError("User already exists. Please login", 409);

        // VERIFY ADMIN REGISTRATION
        if (role) {
            // CHECK CODE
            if (`${adminCode}` !== process.env.ADMIN_CODE) throw (new appError('Incorrect Admin Code!', 400))
        }

        const user = await Users.create(req.body)

        // SEND WELCOME MAIL
        let url = process.env.WELCOMEURL
        // await new EmailToUsers(user, url).sendWelcome()

        createSendToken(user, 201, res)

    } catch (error: any) {
        return next(new appError(error.message, error.statusCode))
    }
}

export const login = async (req: IReqBody, res: Response, next: NextFunction) => {

    const { email, password } = req.body

    try {
        if (!(email || password)) {
            throw new appError('Please provide login details', 400)
        }

        const user: IUser | null = await Users.findOne({ email })
        // CHECK IF USER EXISTS WITHOUT LEAKING EXTRA INFOS
        if (!user || !(await user.isValidPassword(password))) {
            throw new appError('Email or Password incorrect', 401)
        }

        createSendToken(user, 201, res)

    } catch (error: any) {
        return next(new appError(error.message, error.statusCode))
    }
}

exports.forgotPassword = async (req: IReqBody, res: Response, next: NextFunction) => {
    const { email } = req.body

    try {

        const user = await Users.findOne({ email });
        if (!user) throw new appError("No User with that email", 401);

        const { resetToken, passwordToken, passwordResetExpiry } = createPasswdResetToken()

        user.passwordToken = passwordToken;
        user.passwordResetExpiry = passwordResetExpiry;

        await user.save()

        //SEND MAIL TO USER TO RESET PASSWORD
        const resetUrl = `${req.protocol}://${req.get(
            "host"
        )}/api/v2/auth/resetpassword/${resetToken}`;

        //5. SEND EMAIL TO CLIENT
        await new EmailToUsers(user, resetUrl).sendPasswordReset();

        //6. SEND JSON RESPONSE
        res.status(200).json({
            status: "success",
            message: `Token sent to mail ${resetUrl}`,
        });

    } catch (error: any) {
        return next(new appError(error.message, error.statusCode))
    }

}

//RESET PASSWORD
exports.resetPassword = async (req: IReqBody, res: Response, next: NextFunction) => {
    //1. CREATE A HASHED TOKEN FROM THE REQ PARAMS
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

        if (!(password === confirmPassword)) {
            throw new appError('Password and ConfirmPassword must be same', 403)
        }

        user.password = password;
        user.passwordToken = null;
        user.passwordResetExpiry = null;

        await user.save();

        const url = `${req.protocol}://${req.get("host")}/api/v1/auth/login`;
        // SEND SUCCESS MAIL TO CLIENT
        await new EmailToUsers(user, url).sendVerifiedPSWD();

        // LOG IN USER AND SEND JWT
        createSendToken(user, 200, res);

    } catch (error: any) {
        return next(new appError(error.message, error.statusCode))
    }
}
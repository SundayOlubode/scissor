import passport from "passport"
import dotenv from "dotenv"
dotenv.config();
import { IUser, Users } from "../models/userSchema";
import appError from "../utils/appError"

//STRATEGIES
import googleStrategy, { VerifyCallback } from "passport-google-oauth2"
import { Request } from "express";

const HOSTNAME = (process.env.NODE_ENV === 'production') ? 'https://www.circle7.codes' : `http://localhost:${process.env.PORT}`

const GoogleStrategy = googleStrategy.Strategy

// GOOGLE STARTEGY
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: `${HOSTNAME}/api/v1/auth/google/callback`,
            scope: ['profile', 'email'],
            passReqToCallback: true,
        },
        async (req: Request, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) => {            
            const googleDetails = {
                googleId: profile.id,
                email: profile.email,
                username: profile.displayName,
            };

            if (!googleDetails) {
                const error = new appError("User credentials are required!", 401);
                done(error);
            }

            // CHECK IF USER EXISTS OR CREATE USER
            try {
                const oldUser: IUser | null = await Users.findOne({
                    where: { googleId: googleDetails.googleId },
                });

                // IF USER EXISTS SEND USER WITH TOKEN
                if (oldUser) {
                    const token = await oldUser.createJwt();
                    return done(null, { oldUser, token });
                }

                // CREATE USER IF NEW
                const user: IUser = await Users.create({ ...googleDetails });
                const token = await user.createJwt();

                done(null, { user, token })

            } catch (error: any) {
                done(error);
            }
        }
    )
);


passport.serializeUser((user, done) => {
    done(null, user)
})
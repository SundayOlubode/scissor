import mailGun from 'mailgun-js'
import appError from './appError'
import dotenv from 'dotenv'
dotenv.config()
import { IUser } from '../models/userSchema'

const mailgunAuth = {
    apiKey: process.env.MAILGUN_API_KEY!,
    domain: process.env.MAILGUN_DOMAIN!
};

const mg = mailGun(mailgunAuth)

const DEV_ADMIN_MAIL = process.env.DEV_ADMIN_MAIL
const PROD_ADMIN_MAIL = process.env.PROD_ADMIN_MAIL

/**
 * Send Email
 */
class Email {
    to: string;
    username: string;
    url: string;
    from: string;

    constructor(user: IUser, url: string) {
        this.to = user.email;
        this.username = user.username!
        this.url = url
        this.from = `${process.env.EMAIL_SENDER} ${process.env.EMAIL_FROM}`;
    }

    async send(template: string, subject: string) {

        const data = {
            from: this.from,
            to: this.to,
            subject,
            template,
            'h:X-Mailgun-Variables': JSON.stringify({
                username: this.username,
                url: this.url,
            })
        }

        try {
            await mg.messages().send(data)
        } catch (error: any) {
            throw new appError(error.message, 500)
        }

    }

    // SEND PASSWORD RESET LINK
    async sendPasswordReset() {
        await this.send("reset-password-scissor", "Your password reset link(valid for only 10 minutes)");
    }

    // SEND SUCCESFUL PASSWORD RESET MAIL
    async sendVerifiedPSWD() {
        await this.send('verified-pswd-scissor', 'You have reset your password successfully!')
    }
}

export default Email
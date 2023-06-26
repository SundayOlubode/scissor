"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailgun_js_1 = __importDefault(require("mailgun-js"));
const appError_1 = __importDefault(require("./appError"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mailgunAuth = {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
};
const mg = (0, mailgun_js_1.default)(mailgunAuth);
const DEV_ADMIN_MAIL = process.env.DEV_ADMIN_MAIL;
const PROD_ADMIN_MAIL = process.env.PROD_ADMIN_MAIL;
/**
 * Send Email
 */
class Email {
    constructor(user, url) {
        this.to = user.email;
        this.username = user.username;
        this.url = url;
        this.from = `${process.env.EMAIL_SENDER} ${process.env.EMAIL_FROM}`;
    }
    send(template, subject) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                from: this.from,
                to: this.to,
                subject,
                template,
                'h:X-Mailgun-Variables': JSON.stringify({
                    username: this.username,
                    url: this.url,
                })
            };
            try {
                yield mg.messages().send(data);
            }
            catch (error) {
                throw new appError_1.default(error.message, 500);
            }
        });
    }
    // SEND PASSWORD RESET LINK
    sendPasswordReset() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send("reset-password-scissor", "Your password reset link(valid for only 10 minutes)");
        });
    }
    // SEND SUCCESFUL PASSWORD RESET MAIL
    sendVerifiedPSWD() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send('verified-pswd-scissor', 'You have reset your password successfully!');
        });
    }
}
exports.default = Email;

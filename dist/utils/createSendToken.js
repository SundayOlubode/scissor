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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * CREATE FUNCTION THAT HANDLES TOKEN RESPONSE & COOKIE RESPONSE
 */
const createSendToken = (user, statusCode, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield user.createJwt();
    const cookieOptions = {
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "none",
    };
    if (process.env.NODE_ENV === "production")
        cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);
    user.password = undefined;
    return res.status(statusCode).json({
        status: "Success",
        data: {
            user,
            token,
        },
    });
});
exports.default = createSendToken;

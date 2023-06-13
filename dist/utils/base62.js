"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base62Hash = (url) => {
    let hashedStr = '';
    let urlLen = url.length;
    let str = '0123456789abcdefghujklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    while (urlLen > 0) {
        hashedStr += str[urlLen % 62];
        urlLen /= 62;
    }
    console.log(hashedStr);
    return hashedStr;
};
base62Hash('www.dhhhhfhfhfhfhfhfhfhfh.com/jkkdkdkdkkkkffffffffffejfjeeeeeejhsdddddddddffffff');
exports.default = base62Hash;

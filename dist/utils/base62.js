"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function convertToBase62(url) {
    const characterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const base = 62;
    const length = 7;
    let numericValue = 0;
    // Convert string to numeric value
    for (let i = 0; i < url.length; i++) {
        numericValue += url.charCodeAt(i);
    }
    // Perform base62 conversion
    let base62Representation = '';
    while (numericValue > 0) {
        const remainder = numericValue % base;
        base62Representation = characterSet.charAt(remainder) + base62Representation;
        numericValue = Math.floor(numericValue / base);
    }
    // Pad with leading zeros if necessary
    while (base62Representation.length < length) {
        base62Representation = '0' + base62Representation;
    }
    return base62Representation;
}
exports.default = convertToBase62;

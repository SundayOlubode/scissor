/**
 * RETURNS BASE 62 REPRESENTATION OF THE INPUT
 * @returns String
 */
function convertToBase62(url: string): string {
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

    // Pad with leading random characters if necessary
    while (base62Representation.length < length) {
        
        base62Representation = characterSet.charAt(Math.floor(Math.random() * base)) + base62Representation;
    }

    return base62Representation;
}

export default convertToBase62
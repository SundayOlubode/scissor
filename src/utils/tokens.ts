import crypto from 'crypto'

export const createPasswdResetToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    const passwordResetExpiry = Date.now() + 10 * 60 * 1000;
    return {resetToken, passwordToken, passwordResetExpiry}
}
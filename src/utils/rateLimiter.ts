import rateLimiter from 'express-rate-limit'
import { Request } from 'express'


/**
 * Rate Limiter
 * Limits each User(or IP) to 30 requests per 2 mins
 */
// @ts-ignore
const limiter = rateLimiter({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 30, // Limit each User OR IP to 30 requests per `window` (here, per 2 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests!',
    skipFailedRequests: true,
    keyGenerator: (req: Request, res) => { // USER ID OR IP
        return req.user || req.ip
    }
})


export default limiter
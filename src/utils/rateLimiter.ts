import rateLimiter from 'express-rate-limit'

/**
 * Rate Limiter
 */
const limiter = rateLimiter({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 30, // Limit each IP to 30 requests per `window` (here, per 2 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests!',
    skipFailedRequests: true
})


export default limiter
import express, { Application } from 'express'
import bodyParser from 'body-parser'
import httpLogger from './utils/httpLogger'
import rateLimiter from './utils/rateLimiter'
import globalErrorHandler from './controllers/errorController'
import appError from './utils/appError'
import authRouter from './routers/authRouter'
import redirection from './controllers/urlController'
import getLocation from './middlewares/location'
import userRouter from './routers/userRouter'
require('./configs/OAuth')

const app: Application = express()

interface ISession {
    secret: string
    resave: boolean
    saveUninitialized: boolean
}

import session from 'express-session'

// USE SESSION
app.use(
    session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false
    })
)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(httpLogger)
app.use(rateLimiter)



app.get('/', (req, res, next) => {
    return res.status(200).json({
        message: 'Success',
        data: 'Welcome!!!'
    })
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/user', userRouter)

app.get('/:shortUrl', getLocation, redirection)

app.use('*', (req, res, next) => {
    return next(new appError(`${req.originalUrl} not found on this server`, 404));
})
app.use(globalErrorHandler)

export default app
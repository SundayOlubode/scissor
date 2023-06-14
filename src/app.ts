import express from 'express'
import bodyParser from 'body-parser'
import httpLogger from './utils/httpLogger'
import rateLimiter from './utils/rateLimiter'
import urlRouter from './routers/urlRouter'
import globalErrorHandler from './controllers/errorController'
import appError from './utils/appError'
import db from './models/db'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

db.init()
app.use(httpLogger)
app.use(rateLimiter)


app.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Success',
        data: 'Welcome!!!'
    })
})

app.use('/api/v1/url', urlRouter)

app.use('*', (req, res, next) => {
    return next(new appError(`${req.originalUrl} not found on this server`, 404));
})
app.use(globalErrorHandler)

export default app
import express from 'express'
import bodyParser from 'body-parser'
import httpLogger from './utils/httpLogger'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(httpLogger)


app.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Success',
        data: 'Some data'
    })
})


export default app
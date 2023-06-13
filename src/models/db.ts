import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()
import appError from '../utils/appError' 
import logger from '../utils/logger'

const url: string = process.env.NODE_ENV === 'production'? process.env.PROD_DB_URL! : process.env.DEV_DB_URL!

const connectDB = async () => {
    try {
        await mongoose.connect(url)
        logger.info('DB Connected!')
        return;
    } catch (error: any) {
        throw new appError(error.message, 500)
    }
}

const db = {
    init: () => {
        connectDB()
    }
}

export default db
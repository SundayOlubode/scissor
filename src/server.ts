import app from './app'
import dotenv from 'dotenv'
import logger from './utils/logger'
import db from './models/db'
import Cache from './configs/redis'

dotenv.config()

const PORT = process.env.PORT

process.on('uncaughtException', (error) => {
    logger.error("UNCAUGHT EXCEPTION! 🔥 Shutting Down...");
    logger.error(error.name, error.message);
    process.exit(1);

})

const server = app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
    db.init()
    Cache.connect()
})

process.on('unhandledRejection', (reason) => {
    logger.error("UNHANDLED REJECTION! 🔥 Shutting Down...");
    logger.error({ 'REASON': reason });
    server.close(() => {
        process.exit(1);
    });
})
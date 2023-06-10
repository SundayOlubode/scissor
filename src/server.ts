import app from './app'
import dotenv from 'dotenv'
import logger from './utils/logger'

dotenv.config()

const PORT = process.env.PORT

process.on('uncaughtException', (error) => {
    logger.info("UNCAUGHT EXCEPTION! 🔥 Shutting Down...");
    logger.info(error.name, error.message);
    process.exit(1);

})

const server = app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
})

process.on('unhandledRejection', (reason) => {
    logger.info("UNHANDLED REJECTION! 🔥 Shutting Down...");
    logger.info({ 'REASON': reason });
    server.close(() => {
        process.exit(1);
    });
})
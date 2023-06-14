import { RedisClientType, createClient } from 'redis';
import dotenv from 'dotenv';
import logger from '../utils/logger';
import appError from '../utils/appError';

dotenv.config()

const REDIS_PORT = parseInt(process.env.REDIS_PORT!);
const REDIS_HOST = process.env.REDIS_HOST!;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD!;

class Cache {
    client: RedisClientType;

    constructor() {
        this.client = createClient({
            password: REDIS_PASSWORD,
            socket: {
                host: REDIS_HOST,
                port: REDIS_PORT
            }
        });
    }

    async connect() {
        try {

            await this.client.connect()

        } catch (error: any) {
            logger.error(error.message)
            throw new appError(error.message, 500)
        }
    }
}

const { client } = new Cache()

export default client;
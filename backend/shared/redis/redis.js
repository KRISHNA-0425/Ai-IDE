import Redis from 'ioredis'
import dotenv from 'dotenv'
dotenv.config();

let url = process.env.REDIS_URL

const redis = new Redis(url);


redis.on("connect", () => {
    console.log('redis connected');
})

export default redis
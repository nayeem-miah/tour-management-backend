import { createClient } from 'redis';
import { envVars } from './env';


console.log(envVars.REDIS_USERNAME, "||", envVars.REDIS_PASSWORD, "||", envVars.REDIS_HOST, "||", Number(envVars.PORT));


const redisClient = createClient({
    username: envVars.REDIS_USERNAME,
    password: envVars.REDIS_PASSWORD,
    socket: {
        host: envVars.REDIS_HOST,
        port: Number(envVars.REDIS_PORT)
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));



// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar



export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Redis connected");
    }
}

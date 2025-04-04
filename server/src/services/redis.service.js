import { createClient } from "redis"
import dotenv from 'dotenv';

dotenv.config({
    path: '.env'
});

const client = createClient({
    url: process.env.REDIS_URL
});

client.on("error", function (err) {
    throw err;
});
await client.connect()
await client.set('foo', 'bar');

export default client;
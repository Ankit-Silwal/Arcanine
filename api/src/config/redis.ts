import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

redis.on("connect", () => {
    console.log("connected to the redis");
});

redis.on("error", (err:any) => {
    console.log("Error connecting to the redis server", err);
});

export default redis;
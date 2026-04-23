import dotenv from "dotenv";
dotenv.config();
console.log(process.env.DB_URL)
import app from "./app.js";
import pool from "./config/db.js";
import redis from "./config/redis.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    const dbTest = await pool.query("SELECT NOW()");
    console.log("Database connection successful:", dbTest.rows);
    const redisTest = await redis.ping();
    console.log("Redis connection successful:", redisTest);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};


startServer();

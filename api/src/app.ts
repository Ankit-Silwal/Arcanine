import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import redis from "./config/redis.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export default app;

import {  Pool } from "pg";

const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "tahaxaina",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "arcanine"
});

pool.on('connect', () => {
    console.log('connected to the db');
});

pool.on('error', (err) => {
    console.error('error connecting to the db', err);
});

export default pool;
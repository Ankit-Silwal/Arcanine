import {  Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DB_URL
});

pool.on('connect', () => {
    console.log('connected to the db');
});

pool.on('error', (err) => {
    console.error('error connecting to the db', err);
});

export default pool;
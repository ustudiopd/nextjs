// lib/db.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

export default pool;

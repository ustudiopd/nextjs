// lib/db.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING, // 환경변수에 연결 문자열 저장
  ssl: {
    rejectUnauthorized: false, // NeonDB의 경우 SSL 모드 설정 (필요한 경우)
  },
});

export default pool;

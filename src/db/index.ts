import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

// Function to create a new connection pool.
export const createPool = () => {
  const host = process.env.SQL_HOST;
  const user = process.env.SQL_USER || process.env.SQL_ADMIN_USER;
  const password = process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD;
  const database = process.env.SQL_DB_NAME;

  console.log(`Initializing SQL Pool: host=${host}, user=${user}, database=${database} (derived from SQL_USER=${!!process.env.SQL_USER}, SQL_ADMIN_USER=${!!process.env.SQL_ADMIN_USER})`);

  return new Pool({
    host,
    user,
    password,
    database,
    connectionTimeoutMillis: 15000,
  });
};

// Create a pool instance.
const pool = createPool();

// Prevent unhandled pool-level errors from crashing the application.
pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });
export * from './schema.ts';

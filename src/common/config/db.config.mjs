import pg from "pg";

const dbPort = Number(process.env.DB_PORT || 5433);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number.isNaN(dbPort) ? 5433 : dbPort,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "sql_class_2_db",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  max: 20,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 30000,
});

// create table
export const initDB = async () => {
  try {
    // ১. Users table
    const userTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL 
    );`;
    await pool.query(userTableQuery);

    // ২. Seats table
    const seatsTableQuery = `
    CREATE TABLE IF NOT EXISTS seats (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id),
      isbooked INT DEFAULT 0
    );`;
    await pool.query(seatsTableQuery);

    // Ensure the column exists for existing tables
    await pool.query(
      "ALTER TABLE seats ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id)",
    );

    // ৩. Seats if table is empty then insert 20 rows
    const checkSeats = await pool.query("SELECT COUNT(*) FROM seats");
    if (parseInt(checkSeats.rows[0].count) === 0) {
      await pool.query(
        "INSERT INTO seats (isbooked) SELECT 0 FROM generate_series(1, 60)",
      );
    }

    console.log("Database tables initialized successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};
export default pool;

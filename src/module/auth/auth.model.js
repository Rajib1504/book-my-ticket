import pool from "../../common/config/db.config.mjs";

const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
};

const createUser = async (name, email, password) => {
  const result = await pool.query(
    "INSERT INTO users(name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
    [name, email, password]
  );
  return result.rows[0];
};

export default {
  findUserByEmail,
  createUser,
};

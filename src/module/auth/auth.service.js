import pool from "../../common/config/db.config.mjs";
import bcrypt from "bcrypt";
import AppError from "../../common/utils/api-error.js";
const register = async (userdata) => {
  const { name, email, password } = userdata;
  try {
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userCheck.rowCount > 0) {
      throw AppError.conflict("User already exists");
    }
    //     if not exist in database then create user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const result = await pool.query(
      "INSERT INTO users(name,email,password) VALUES ($1,$2,$3) RETURNING *",
      [name, email, passwordHash],
    );
    return result.rows[0];
  } catch (error) {
    console.log("registration failed:", error.message);
  }
};

export { register };

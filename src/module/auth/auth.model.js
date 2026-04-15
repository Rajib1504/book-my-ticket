import pool from "../../common/config/db.config.mjs";
import { mockState, getMockUserByEmail, createMockUser } from "../../common/config/mock-state.js";

const findUserByEmail = async (email) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
      console.warn("DB down, using mock fallback for findUserByEmail");
      mockState.isDbDown = true;
      return getMockUserByEmail(email);
    }
    throw error;
  }
};

const createUser = async (name, email, password) => {
  try {
    const result = await pool.query(
      "INSERT INTO users(name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, password]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
      console.warn("DB down, using mock fallback for createUser");
      mockState.isDbDown = true;
      return createMockUser(name, email, password);
    }
    throw error;
  }
};

export default {
  findUserByEmail,
  createUser,
};

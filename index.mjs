import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import authRouter from "./src/module/auth/auth.route.js";
import pool, { initDB } from "./src/common/config/db.config.mjs";
import authMiddleware from "./src/common/middleware/auth.middleware.js";
import { mockState, getMockSeats, bookMockSeat } from "./src/common/config/mock-state.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 8080;

const app = new express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//get all seats
app.get("/seats", async (req, res) => {
  try {
    const result = await pool.query("select * from seats");
    res.send(result.rows);
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
      console.warn("DB down, using mock fallback for /seats");
      return res.send(getMockSeats());
    }
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

//book a seat - now protected by auth middleware
app.put("/seats/book/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id; // From the JWT token via authMiddleware

    const conn = await pool.connect();
    await conn.query("BEGIN");
    
    // Select seat for update (locking the row)
    const sql = "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE";
    const result = await conn.query(sql, [id]);

    if (result.rowCount === 0) {
      await conn.query("ROLLBACK");
      conn.release();
      res.status(400).send({ error: "Seat already booked" });
      return;
    }

    // Update seat with logged-in user's ID
    const sqlU = "update seats set isbooked = 1, user_id = $2 where id = $1";
    const updateResult = await conn.query(sqlU, [id, userId]);

    await conn.query("COMMIT");
    conn.release();
    res.send({ message: "Seat booked successfully!", data: updateResult.rows[0] });
  } catch (ex) {
    if (ex.code === 'ECONNREFUSED' || ex.message.includes('connect')) {
      console.warn("DB down, using mock fallback for booking");
      const success = bookMockSeat(req.params.id, req.user.id);
      if (success) {
        return res.send({ message: "Seat booked successfully (MOCK)!" });
      } else {
        return res.status(400).send({ error: "Seat already booked or invalid ID" });
      }
    }
    console.log(ex);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Backward compatibility for existing frontend
app.put("/:id/:name", (req, res) => {
  res.redirect(307, `/seats/book/${req.params.id}`);
});

// Global error handler — must have 4 args for Express to treat it as error middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

initDB()
  .then(() => {
    app.listen(port, () => console.log("Server starting on port: " + port));
  })
  .catch((err) => {
    console.error("Failed to initialize database, but server will continue in mock mode if needed.");
    app.listen(port, () => console.log("Server starting (MOCK MODE) on port: " + port));
  });

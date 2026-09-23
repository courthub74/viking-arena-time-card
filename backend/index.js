// API

// Import required modules
const express = require("express");
const pool = require("./db");
const bcrypt = require("bcrypt");

const app = express();
const port = 3000;

app.use(express.json());

// Define routes
app.get("/", (req, res) => {
  res.send("Viking Arena Time Card API is running.");
});

// Test database connection
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "PostgreSQL connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Database connection failed",
    });
  }
});

// GET all users
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, role, created_at
       FROM users
       ORDER BY id`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to retrieve users",
    });
  }
});

// Verify a user's login credentials
app.post("/login", async (req, res) => {
  try {
    const { userId, pin } = req.body;
    const normalizedUserId = Number(userId);

    if (
      !Number.isInteger(normalizedUserId) ||
      normalizedUserId <= 0 ||
      typeof pin !== "string" ||
      !/^\d{4}$/.test(pin)
    ) {
      return res.status(400).json({
        error: "A valid user and four-digit PIN are required",
      });
    }

    const result = await pool.query(
      `SELECT id, first_name, last_name, role, pin_hash
       FROM users
       WHERE id = $1`,
      [normalizedUserId],
    );

    const user = result.rows[0];

    // Use one generic message so the response does not reveal
    // whether the user or PIN was incorrect.
    if (!user) {
      return res.status(401).json({
        error: "Invalid user or PIN",
      });
    }

    const pinMatches = await bcrypt.compare(pin, user.pin_hash);

    if (!pinMatches) {
      return res.status(401).json({
        error: "Invalid user or PIN",
      });
    }

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to process login",
    });
  }
});

// CREATE a user
app.post("/users", async (req, res) => {
  try {
    const { firstName, lastName, role, pin } = req.body;

    // Require all inputs to be strings
    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof role !== "string" ||
      typeof pin !== "string"
    ) {
      return res.status(400).json({
        error: "First name, last name, role, and PIN are required",
      });
    }

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedRole = role.trim().toLowerCase();
    const normalizedPin = pin.trim();

    if (
      !normalizedFirstName ||
      !normalizedLastName ||
      !normalizedRole ||
      !normalizedPin
    ) {
      return res.status(400).json({
        error: "First name, last name, role, and PIN are required",
      });
    }

    // Match the varchar(50) database columns
    if (normalizedFirstName.length > 50 || normalizedLastName.length > 50) {
      return res.status(400).json({
        error: "First name and last name must not exceed 50 characters",
      });
    }

    // Match the database role constraint
    if (!["employee", "manager"].includes(normalizedRole)) {
      return res.status(400).json({
        error: "Role must be employee or manager",
      });
    }

    if (!/^\d{4}$/.test(normalizedPin)) {
      return res.status(400).json({
        error: "PIN must contain exactly four digits",
      });
    }

    const pinHash = await bcrypt.hash(normalizedPin, 12);

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, role, pin_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, first_name, last_name, role, created_at`,
      [normalizedFirstName, normalizedLastName, normalizedRole, pinHash],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to create user",
    });
  }
});

// Port the app to listen on the specified port
app.listen(port, () => {
  console.log(`Viking Arena Time Card API is running on ${port}`);
});

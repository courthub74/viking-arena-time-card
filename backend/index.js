// API

// Import required modules

// express
const express = require("express");

// pool database connection
const pool = require("./db");

// bcrypt for hashing and comparing PINs
const bcrypt = require("bcrypt");

// cors for cross-origin requests
const cors = require("cors");

// Create an Express app
const app = express();

// port for the server to listen on
const port = 3000;

app.use(cors());
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
      `SELECT id, first_name, last_name, role, job_title, created_at
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
      `SELECT id, first_name, last_name, role, job_title, pin_hash
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
        jobTitle: user.job_title,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to process login",
    });
  }
});

// PUBLIC employee registration
app.post("/users", async (req, res) => {
  try {
    const { firstName, lastName, jobTitle, pin } = req.body;

    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof jobTitle !== "string" ||
      typeof pin !== "string"
    ) {
      return res.status(400).json({
        error: "First name, last name, job title, and PIN are required",
      });
    }

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedJobTitle = jobTitle
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    const normalizedPin = pin.trim();

    if (
      !normalizedFirstName ||
      !normalizedLastName ||
      !normalizedJobTitle ||
      !normalizedPin
    ) {
      return res.status(400).json({
        error: "First name, last name, job title, and PIN are required",
      });
    }

    if (normalizedFirstName.length > 50 || normalizedLastName.length > 50) {
      return res.status(400).json({
        error: "First name and last name must not exceed 50 characters",
      });
    }

    const allowedJobTitles = [
      "employee",
      "zamboni_driver",
      "skate_instructor",
      "skate_guard",
    ];

    if (!allowedJobTitles.includes(normalizedJobTitle)) {
      return res.status(400).json({
        error: "Invalid employee job title",
      });
    }

    if (!/^\d{4}$/.test(normalizedPin)) {
      return res.status(400).json({
        error: "PIN must contain exactly four digits",
      });
    }

    const pinHash = await bcrypt.hash(normalizedPin, 12);

    const result = await pool.query(
      `INSERT INTO users (
         first_name,
         last_name,
         role,
         job_title,
         pin_hash
       )
       VALUES ($1, $2, 'employee', $3, $4)
       RETURNING
         id,
         first_name,
         last_name,
         role,
         job_title,
         created_at`,
      [normalizedFirstName, normalizedLastName, normalizedJobTitle, pinHash],
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

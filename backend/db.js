// backend/db.js

const { Pool } = require("pg");

const pool = new Pool({
  user: "courtney",
  host: "localhost",
  database: "viking_arena",
  port: 5432,
});

module.exports = pool;

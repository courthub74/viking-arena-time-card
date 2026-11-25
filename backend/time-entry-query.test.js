const test = require("node:test");
const assert = require("node:assert/strict");
const { insertTimeEntrySql } = require("./time-entry-query");
const pool = require("./db");

// Start writing your test here.

// When I save a shift from 6:30 AM to 2:30 PM, the total_hours should be 8.0
test("Returns 8 hours for a 6:30 AM to 2:30 PM shift", async () => {
  // Next, connect to the test database and run shared query

  // Arrange: Set up the test data
  const userId = 1; // Assuming user with ID 1 exists and is an employee
  const clockInDate = new Date("2024-06-01T06:30:00Z");
  const clockOutDate = new Date("2024-06-01T14:30:00Z");

  // Clean up: Optionally, delete the inserted time entry to keep the test database clean
  // Connect to the database and run the query
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Act: Execute the SQL query to insert a new time entry
    const result = await client.query(insertTimeEntrySql, [
      userId,
      clockInDate.toISOString(),
      clockOutDate.toISOString(),
    ]);

    // Assert: Check that the total_hours is 8.0
    assert.strictEqual(result.rows.length, 1);
    assert.strictEqual(Number(result.rows[0].total_hours), 8);

    // Run insertTimeEntrySql using this same client.
    // Assert that the query returned one row and 7.5 hours.
  } finally {
    try {
      await client.query("ROLLBACK");
    } finally {
      client.release(); // Return the client to the pool.
    }
  }
});

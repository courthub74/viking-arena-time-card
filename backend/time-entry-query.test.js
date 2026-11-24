const test = require("node:test");
const assert = require("node:assert/strict");
const { insertTimeEntrySql } = require("./time-entry-query");

// Start writing your test here.

// When I save a shift from 6:30 AM to 2:30 PM, the total_hours should be 8.0
test("Returns 8 hours for a 6:30 AM to 2:30 PM shift", async () => {
  // Next, connect to the test database and run shared query
});

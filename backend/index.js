// API

// IMPORTS - required modules

// express
const express = require("express");

// pool database connection
const pool = require("./db");

// bcrypt for hashing and comparing PINs
const bcrypt = require("bcrypt");

// cors for cross-origin requests
const cors = require("cors");

// session and pg session imports
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);

// Create an Express app
const app = express();

// port for the server to listen on
const port = 3000;

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required in backend/.env");
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
// MIDDLEWARE
app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    name: "viking.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Local HTTP development
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    },
  }),
);

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// Require a valid employee login for employee-only operations.
async function requireEmployee(req, res, next) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        error: "Not logged in",
      });
    }

    const result = await pool.query(
      `SELECT id, role
       FROM users
       WHERE id = $1`,
      [req.session.userId],
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        error: "Not logged in",
      });
    }

    if (user.role !== "employee") {
      return res.status(403).json({
        error: "Employee access required",
      });
    }

    req.authenticatedUser = user;
    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to verify login session",
    });
  }
}

// for manager operations
async function requireManager(req, res, next) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        error: "Not logged in",
      });
    }

    const result = await pool.query(
      `SELECT id, role
       FROM users
       WHERE id = $1`,
      [req.session.userId],
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        error: "Not logged in",
      });
    }

    if (user.role !== "manager") {
      return res.status(403).json({
        error: "Manager access required",
      });
    }

    req.authenticatedUser = user;
    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to verify login session",
    });
  }
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
// ROUTES
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

    // Old Successful Response Block
    // return res.json({
    //   message: "Login successful",
    //   user: {
    //     id: user.id,
    //     firstName: user.first_name,
    //     lastName: user.last_name,
    //     role: user.role,
    //     jobTitle: user.job_title,
    //   },
    // });

    // Now we Replace any previous session after successful PIN verification.
    req.session.regenerate((error) => {
      if (error) {
        console.error(error);
        return res.status(500).json({
          error: "Failed to create login session",
        });
      }

      req.session.userId = user.id;

      req.session.save((error) => {
        if (error) {
          console.error(error);
          return res.status(500).json({
            error: "Failed to save login session",
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
      });
    });
    // Catch Block
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

// Get all time entries for one employee
app.get("/users/:userId/time-entries", requireEmployee, async (req, res) => {
  try {
    const normalizedUserId = Number(req.params.userId);

    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
      return res.status(400).json({
        error: "A valid employee ID is required",
      });
    }

    if (normalizedUserId !== req.authenticatedUser.id) {
      return res.status(403).json({
        error: "You can only view your own time entries",
      });
    }

    // Existing employeeResult query continues here.

    const employeeResult = await pool.query(
      `SELECT id
       FROM users
       WHERE id = $1
         AND role = 'employee'`,
      [normalizedUserId],
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({
        error: "Employee not found",
      });
    }

    const result = await pool.query(
      `SELECT
         id,
         user_id,
         clock_in,
         clock_out,
         EXTRACT(EPOCH FROM (clock_out - clock_in)) / 3600
           AS total_hours,
         created_at
       FROM time_entries
       WHERE user_id = $1
       ORDER BY clock_in ASC`,
      [normalizedUserId],
    );

    const timeEntries = result.rows.map((entry) => ({
      ...entry,
      total_hours: Number(entry.total_hours),
    }));

    return res.json(timeEntries);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to retrieve time entries",
    });
  }
});

// Create a time entry
app.post("/time-entries", requireEmployee, async (req, res) => {
  try {
    const { clockIn, clockOut } = req.body || {};

    const normalizedUserId = req.authenticatedUser.id;

    const clockInDate = new Date(clockIn);
    const clockOutDate = new Date(clockOut);

    if (
      !Number.isInteger(normalizedUserId) ||
      normalizedUserId <= 0 ||
      typeof clockIn !== "string" ||
      typeof clockOut !== "string"
    ) {
      return res.status(400).json({
        error:
          "A valid user ID, clock-in time, and clock-out time are required",
      });
    }

    if (
      Number.isNaN(clockInDate.getTime()) ||
      Number.isNaN(clockOutDate.getTime())
    ) {
      return res.status(400).json({
        error: "Clock-in and clock-out must be valid timestamps",
      });
    }

    const durationMilliseconds = clockOutDate.getTime() - clockInDate.getTime();

    if (durationMilliseconds <= 0) {
      return res.status(400).json({
        error: "Clock-out must be after clock-in",
      });
    }

    const maximumDurationMilliseconds = 24 * 60 * 60 * 1000;

    if (durationMilliseconds > maximumDurationMilliseconds) {
      return res.status(400).json({
        error: "A time entry cannot exceed 24 hours",
      });
    }

    const result = await pool.query(
      `INSERT INTO time_entries (
         user_id,
         clock_in,
         clock_out
       )
       SELECT
         id,
         $2,
         $3
       FROM users
       WHERE id = $1
         AND role = 'employee'
       RETURNING
         id,
         user_id,
         clock_in,
         clock_out,
         EXTRACT(EPOCH FROM (clock_out - clock_in)) / 3600
           AS total_hours,
         created_at`,
      [normalizedUserId, clockInDate.toISOString(), clockOutDate.toISOString()],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Employee not found",
      });
    }

    result.rows[0].total_hours = Number(result.rows[0].total_hours);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to create time entry",
    });
  }
});

// Update an existing employee time entry
app.put("/time-entries/:entryId", requireEmployee, async (req, res) => {
  try {
    const entryId = Number(req.params.entryId);
    const { clockIn, clockOut } = req.body || {};

    // For DB user ID
    const normalizedUserId = req.authenticatedUser.id;

    if (
      !Number.isInteger(entryId) ||
      entryId <= 0 ||
      !Number.isInteger(normalizedUserId) ||
      normalizedUserId <= 0 ||
      typeof clockIn !== "string" ||
      typeof clockOut !== "string"
    ) {
      return res.status(400).json({
        error:
          "Valid entry and employee IDs, clock-in, and clock-out are required",
      });
    }

    const clockInDate = new Date(clockIn);
    const clockOutDate = new Date(clockOut);

    if (
      Number.isNaN(clockInDate.getTime()) ||
      Number.isNaN(clockOutDate.getTime())
    ) {
      return res.status(400).json({
        error: "Clock-in and clock-out must be valid timestamps",
      });
    }

    const durationMilliseconds = clockOutDate.getTime() - clockInDate.getTime();

    if (durationMilliseconds <= 0) {
      return res.status(400).json({
        error: "Clock-out must be after clock-in",
      });
    }

    if (durationMilliseconds > 24 * 60 * 60 * 1000) {
      return res.status(400).json({
        error: "A time entry cannot exceed 24 hours",
      });
    }

    const result = await pool.query(
      `UPDATE time_entries AS entry
       SET clock_in = $3,
           clock_out = $4,
           updated_at = now()
       FROM users AS employee
       WHERE entry.id = $1
         AND entry.user_id = $2
         AND employee.id = entry.user_id
         AND employee.role = 'employee'
       RETURNING
         entry.id,
         entry.user_id,
         entry.clock_in,
         entry.clock_out,
         EXTRACT(EPOCH FROM (entry.clock_out - entry.clock_in)) / 3600
           AS total_hours,
         entry.created_at,
         entry.updated_at`,
      [
        entryId,
        normalizedUserId,
        clockInDate.toISOString(),
        clockOutDate.toISOString(),
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Employee time entry not found",
      });
    }

    result.rows[0].total_hours = Number(result.rows[0].total_hours);

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to update time entry",
    });
  }
});

// Does browser send cookie to backend
// Check the current server-side login session
app.get("/session", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        error: "Not logged in",
      });
    }

    const result = await pool.query(
      `SELECT id, first_name, last_name, role, job_title
       FROM users
       WHERE id = $1`,
      [req.session.userId],
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        error: "Not logged in",
      });
    }

    return res.json({
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
      error: "Failed to check login session",
    });
  }
});

// Destroy the server-side session and clear its cookie.
app.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        error: "Failed to log out",
      });
    }

    res.clearCookie("viking.sid", {
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.json({
      message: "Logged out successfully",
    });
  });
});

// List employees for the manager's hours review.
app.get("/manager/employees", requireManager, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, job_title
       FROM users
       WHERE role = 'employee'
       ORDER BY last_name, first_name, id`,
    );

    return res.json(result.rows);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to retrieve employees",
    });
  }
});

// Get one employee's time entries for manager review.
app.get(
  "/manager/employees/:userId/time-entries",
  requireManager,
  async (req, res) => {
    try {
      const userId = Number(req.params.userId);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          error: "A valid employee ID is required",
        });
      }

      const employeeResult = await pool.query(
        `SELECT id, first_name, last_name, job_title
         FROM users
         WHERE id = $1 AND role = 'employee'`,
        [userId],
      );

      if (employeeResult.rows.length === 0) {
        return res.status(404).json({
          error: "Employee not found",
        });
      }

      const result = await pool.query(
        `SELECT
           id,
           user_id,
           clock_in,
           clock_out,
           EXTRACT(EPOCH FROM (clock_out - clock_in)) / 3600
             AS total_hours,
           created_at,
           updated_at
         FROM time_entries
         WHERE user_id = $1
         ORDER BY clock_in ASC, id ASC`,
        [userId],
      );

      return res.json({
        employee: employeeResult.rows[0],
        timeEntries: result.rows.map((entry) => ({
          ...entry,
          total_hours: Number(entry.total_hours),
        })),
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Failed to retrieve employee time entries",
      });
    }
  },
);

// Get employee shifts that started on a selected Detroit calendar date.
app.get("/manager/time-entries", requireManager, async (req, res) => {
  try {
    const date = req.query.date;

    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: "A date in YYYY-MM-DD format is required",
      });
    }

    // Check that the date exists, including leap-year handling.
    const parsedDate = new Date(`${date}T00:00:00Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      return res.status(400).json({
        error: "A valid calendar date is required",
      });
    }

    const result = await pool.query(
      `SELECT
         entry.id,
         entry.user_id,
         employee.first_name,
         employee.last_name,
         entry.clock_in,
         entry.clock_out
       FROM time_entries AS entry
       JOIN users AS employee ON employee.id = entry.user_id
       WHERE employee.role = 'employee'
         AND entry.clock_in >=
             ($1::date::timestamp AT TIME ZONE 'America/Detroit')
         AND entry.clock_in <
             (($1::date + 1)::timestamp AT TIME ZONE 'America/Detroit')
       ORDER BY entry.clock_in, employee.last_name,
                employee.first_name, entry.id`,
      [date],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Failed to retrieve calendar entries:", error);

    return res.status(500).json({
      error: "Failed to retrieve employee hours for this date",
    });
  }
});

// Validate a schedule date.
function isValidScheduleDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

const scheduleSlotJobs = {
  driver_one_am: "zamboni_driver",
  driver_two_am: "zamboni_driver",
  driver_one_pm: "zamboni_driver",
  driver_two_pm: "zamboni_driver",
  skate_guard_one: "skate_guard",
  skate_guard_two: "skate_guard",
};

// Retrieve a day's planned assignments.
app.get("/manager/schedules/:date", requireManager, async (req, res) => {
  const date = req.params.date;

  if (!isValidScheduleDate(date)) {
    return res.status(400).json({
      error: "A valid date in YYYY-MM-DD format is required",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         shift.id,
         shift.slot,
         shift.user_id,
         employee.first_name,
         employee.last_name,
         to_char(shift.start_time, 'HH24:MI') AS start_time,
         to_char(shift.end_time, 'HH24:MI') AS end_time,
         shift.ends_at_close
       FROM scheduled_shifts AS shift
       JOIN users AS employee ON employee.id = shift.user_id
       WHERE shift.schedule_date = $1::date
       ORDER BY shift.slot`,
      [date],
    );

    return res.json({
      date,
      shifts: result.rows,
    });
  } catch (error) {
    console.error("Failed to retrieve schedule:", error);

    return res.status(500).json({
      error: "Failed to retrieve schedule",
    });
  }
});

// Replace a day's planned assignments.
app.put("/manager/schedules/:date", requireManager, async (req, res) => {
  const date = req.params.date;
  const shifts = req.body?.shifts;

  if (!isValidScheduleDate(date)) {
    return res.status(400).json({
      error: "A valid date in YYYY-MM-DD format is required",
    });
  }

  if (!Array.isArray(shifts) || shifts.length > 6) {
    return res.status(400).json({
      error: "Provide an array containing up to six shifts",
    });
  }

  const usedSlots = new Set();
  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

  for (const shift of shifts) {
    if (
      !shift ||
      typeof shift !== "object" ||
      !Object.hasOwn(scheduleSlotJobs, shift.slot) ||
      usedSlots.has(shift.slot)
    ) {
      return res.status(400).json({
        error: "Each shift must have a valid, unique slot",
      });
    }

    usedSlots.add(shift.slot);

    if (!Number.isSafeInteger(shift.userId) || shift.userId <= 0) {
      return res.status(400).json({
        error: "Each shift requires a valid employee ID",
      });
    }

    if (
      typeof shift.startTime !== "string" ||
      !timePattern.test(shift.startTime) ||
      typeof shift.endsAtClose !== "boolean"
    ) {
      return res.status(400).json({
        error: "Provide a valid start time and endsAtClose value",
      });
    }

    if (shift.endsAtClose) {
      if (shift.endTime !== null) {
        return res.status(400).json({
          error: "End time must be null when the shift ends at Close",
        });
      }
    } else if (
      typeof shift.endTime !== "string" ||
      !timePattern.test(shift.endTime) ||
      shift.endTime === shift.startTime
    ) {
      return res.status(400).json({
        error: "Provide an end time different from the start time",
      });
    }
  }

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // Serialize simultaneous saves for the same date.
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      `viking-schedule:${date}`,
    ]);

    const employeeIds = [...new Set(shifts.map((shift) => shift.userId))];

    const employees = await client.query(
      `SELECT id, role, job_title
       FROM users
       WHERE id = ANY($1::integer[])
       ORDER BY id
       FOR SHARE`,
      [employeeIds],
    );

    const employeesById = new Map(
      employees.rows.map((employee) => [employee.id, employee]),
    );

    for (const shift of shifts) {
      const employee = employeesById.get(shift.userId);

      if (
        !employee ||
        employee.role !== "employee" ||
        employee.job_title !== scheduleSlotJobs[shift.slot]
      ) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          error: "An employee does not match the selected scheduling role",
        });
      }
    }

    await client.query(
      "DELETE FROM scheduled_shifts WHERE schedule_date = $1::date",
      [date],
    );

    for (const shift of shifts) {
      await client.query(
        `INSERT INTO scheduled_shifts (
           schedule_date,
           slot,
           user_id,
           start_time,
           end_time,
           ends_at_close,
           created_by
         )
         VALUES ($1::date, $2, $3, $4::time, $5::time, $6, $7)`,
        [
          date,
          shift.slot,
          shift.userId,
          shift.startTime,
          shift.endTime,
          shift.endsAtClose,
          req.authenticatedUser.id,
        ],
      );
    }

    await client.query("COMMIT");

    return res.json({
      message: "Schedule saved successfully",
      date,
      savedShifts: shifts.length,
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Schedule rollback failed:", rollbackError);
      }
    }

    console.error("Failed to save schedule:", error);

    return res.status(500).json({
      error: "Failed to save schedule",
    });
  } finally {
    if (client) client.release();
  }
});

// Port the app to listen on the specified port
app.listen(port, () => {
  console.log(`Viking Arena Time Card API is running on ${port}`);
});

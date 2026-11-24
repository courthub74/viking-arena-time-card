// SQL query to insert a new time entry and return the inserted row
const insertTimeEntrySql = `INSERT INTO time_entries (
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
         created_at`;

module.exports = { insertTimeEntrySql };

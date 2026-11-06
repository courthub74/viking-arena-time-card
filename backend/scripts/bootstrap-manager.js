const pool = require("../db");

async function main() {
  const id = Number(process.argv[2]);

  if (process.argv.length !== 3 || !Number.isSafeInteger(id) || id < 1) {
    throw new Error("Usage: node scripts/bootstrap-manager.js <employee-id>");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Prevent two setup commands from creating the first manager at once.
    await client.query("LOCK TABLE public.users IN SHARE ROW EXCLUSIVE MODE");

    const existing = await client.query(
      "SELECT 1 FROM public.users WHERE role = 'manager' LIMIT 1",
    );

    if (existing.rowCount > 0) {
      throw new Error("Setup refused: this database already has a manager.");
    }

    const { rows } = await client.query(
      `UPDATE public.users
       SET role = 'manager', job_title = 'manager', updated_at = now()
       WHERE id = $1 AND role = 'employee' AND deactivated_at IS NULL
       RETURNING id, first_name, last_name`,
      [id],
    );

    if (rows.length !== 1) {
      throw new Error("No active employee found with that ID.");
    }

    await client.query("COMMIT");

    const user = rows[0];
    console.log(
      `Promoted ${user.first_name} ${user.last_name} (ID ${user.id}).`,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

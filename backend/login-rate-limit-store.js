const pool = require("./db");

class LoginRateLimitStore {
  constructor(limiterName) {
    this.limiterName = limiterName;
    this.prefix = `${limiterName}:`;
    this.localKeys = false;
  }

  init(options) {
    this.windowMs = options.windowMs;

    // Remove expired rows periodically.
    // Expiration also happens during increment, so cleanup timing
    // does not determine when someone can log in again.
    this.cleanupTimer = setInterval(
      () => {
        pool
          .query(
            `DELETE FROM public.login_rate_limits
           WHERE limiter_name = $1
             AND reset_at <= clock_timestamp()`,
            [this.limiterName],
          )
          .catch((error) => {
            console.error("Rate-limit cleanup failed:", error);
          });
      },
      10 * 60 * 1000,
    );

    this.cleanupTimer.unref();
  }

  async increment(key) {
    // One atomic statement prevents concurrent requests from
    // overwriting each other's increments.
    const result = await pool.query(
      `INSERT INTO public.login_rate_limits AS counters
         (limiter_name, client_key, total_hits, reset_at)
       VALUES (
         $1,
         $2,
         1,
         clock_timestamp() + ($3::double precision * interval '1 millisecond')
       )
       ON CONFLICT (limiter_name, client_key)
       DO UPDATE SET
         total_hits = CASE
           WHEN counters.reset_at <= clock_timestamp() THEN 1
           ELSE counters.total_hits + 1
         END,
         reset_at = CASE
           WHEN counters.reset_at <= clock_timestamp()
             THEN clock_timestamp()
               + ($3::double precision * interval '1 millisecond')
           ELSE counters.reset_at
         END
       RETURNING total_hits, reset_at`,
      [this.limiterName, key, this.windowMs],
    );

    const row = result.rows[0];

    return {
      totalHits: row.total_hits,
      resetTime: row.reset_at,
    };
  }

  async decrement(key) {
    await pool.query(
      `UPDATE public.login_rate_limits
       SET total_hits = GREATEST(total_hits - 1, 0)
       WHERE limiter_name = $1
         AND client_key = $2
         AND reset_at > clock_timestamp()`,
      [this.limiterName, key],
    );
  }

  async resetKey(key) {
    await pool.query(
      `DELETE FROM public.login_rate_limits
       WHERE limiter_name = $1
         AND client_key = $2`,
      [this.limiterName, key],
    );
  }

  shutdown() {
    clearInterval(this.cleanupTimer);
  }
}

module.exports = LoginRateLimitStore;

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use Heroku's DATABASE_URL
  ssl: {
    rejectUnauthorized: false, // Accept Heroku's SSL settings
  },
});

module.exports = pool;

// Example query to test connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Database connected:", res.rows);
  }
});
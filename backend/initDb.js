const pool = require("./db");

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS transactions (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(60) NOT NULL,
    amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    type        VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    category    VARCHAR(30) NOT NULL,
    date        DATE NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
  );
`;

async function initDb() {
  try {
    console.log("Connecting to database...");
    await pool.query(createTableQuery);
    console.log('Success! The "transactions" table is ready.');
  } catch (err) {
    console.error("Failed to set up the database:", err.message);
  } finally {
    await pool.end();
  }
}

initDb();


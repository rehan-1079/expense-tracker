const pool = require("./db");

async function getAllTransactions() {
  const result = await pool.query(
    "SELECT * FROM transactions ORDER BY date DESC, id DESC"
  );
  return result.rows;
}

async function getTransactionById(id) {
  const result = await pool.query(
    "SELECT * FROM transactions WHERE id = $1",
    [id]
  );
  return result.rows[0];
}

async function createTransaction({ name, amount, type, category, date }) {
  const result = await pool.query(
    `INSERT INTO transactions (name, amount, type, category, date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, amount, type, category, date]
  );
  return result.rows[0];
}

async function updateTransaction(id, { name, amount, type, category, date }) {
  const result = await pool.query(
    `UPDATE transactions
     SET name = $1, amount = $2, type = $3, category = $4, date = $5
     WHERE id = $6
     RETURNING *`,
    [name, amount, type, category, date, id]
  );
  return result.rows[0];
}

async function deleteTransaction(id) {
  const result = await pool.query(
    "DELETE FROM transactions WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
}

async function deleteAllTransactions() {
  await pool.query("DELETE FROM transactions");
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions
};

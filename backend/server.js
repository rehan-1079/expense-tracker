require("dotenv").config();
const express = require("express");
const cors = require("cors");
const transactionModel = require("./transactionModel");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());            
app.use(express.json());    

const VALID_TYPES = ["income", "expense"];

const VALID_CATEGORIES = {
  income: ["Salary", "Freelance", "Business", "Investment", "Other"],
  expense: ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"]
};

function validateTransaction(body) {
  const errors = [];

  if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
    errors.push("Name is required.");
  } else if (body.name.trim().length > 60) {
    errors.push("Name must be 60 characters or fewer.");
  }

  if (body.amount === undefined || body.amount === null || body.amount === "") {
    errors.push("Amount is required.");
  } else {
    const amount = Number(body.amount);
    if (isNaN(amount)) {
      errors.push("Amount must be a number.");
    } else if (amount <= 0) {
      errors.push("Amount must be greater than 0.");
    }
  }

  if (!body.type || !VALID_TYPES.includes(body.type)) {
    errors.push('Type must be either "income" or "expense".');
  }

  if (!body.category || typeof body.category !== "string" || body.category.trim() === "") {
    errors.push("Category is required.");
  } else if (body.type && VALID_TYPES.includes(body.type)) {
    if (!VALID_CATEGORIES[body.type].includes(body.category)) {
      errors.push("Category '" + body.category + "' is not valid for type '" + body.type + "'.");
    }
  }

  if (!body.date || typeof body.date !== "string" || body.date.trim() === "") {
    errors.push("Date is required.");
  } else if (isNaN(new Date(body.date).getTime())) {
    errors.push("Date is not a valid date.");
  }

  return errors;
}

function isValidId(id) {
  return /^\d+$/.test(id);
}

function formatRow(row) {
  if (!row) return row;
  return {
    ...row,
    amount: Number(row.amount),
    date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : row.date
  };
}

app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API is running. Try GET /api/transactions" });
});

app.get("/api/transactions", async (req, res) => {
  try {
    const rows = await transactionModel.getAllTransactions();
    res.status(200).json(rows.map(formatRow));
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Something went wrong while fetching transactions." });
  }
});

app.get("/api/transactions/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid transaction id." });
  }

  try {
    const row = await transactionModel.getTransactionById(req.params.id);
    if (!row) {
      return res.status(404).json({ error: "Transaction not found." });
    }
    res.status(200).json(formatRow(row));
  } catch (err) {
    console.error("Error fetching transaction:", err);
    res.status(500).json({ error: "Something went wrong while fetching the transaction." });
  }
});

app.post("/api/transactions", async (req, res) => {
  const errors = validateTransaction(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const newRow = await transactionModel.createTransaction({
      name: req.body.name.trim(),
      amount: Number(req.body.amount),
      type: req.body.type,
      category: req.body.category,
      date: req.body.date
    });
    res.status(201).json(formatRow(newRow));
  } catch (err) {
    console.error("Error creating transaction:", err);
    res.status(500).json({ error: "Something went wrong while saving the transaction." });
  }
});

app.put("/api/transactions/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid transaction id." });
  }

  const errors = validateTransaction(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const updatedRow = await transactionModel.updateTransaction(req.params.id, {
      name: req.body.name.trim(),
      amount: Number(req.body.amount),
      type: req.body.type,
      category: req.body.category,
      date: req.body.date
    });

    if (!updatedRow) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    res.status(200).json(formatRow(updatedRow));
  } catch (err) {
    console.error("Error updating transaction:", err);
    res.status(500).json({ error: "Something went wrong while updating the transaction." });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid transaction id." });
  }

  try {
    const deletedRow = await transactionModel.deleteTransaction(req.params.id);
    if (!deletedRow) {
      return res.status(404).json({ error: "Transaction not found." });
    }
    res.status(200).json({ message: "Transaction deleted.", deleted: formatRow(deletedRow) });
  } catch (err) {
    console.error("Error deleting transaction:", err);
    res.status(500).json({ error: "Something went wrong while deleting the transaction." });
  }
});

app.delete("/api/transactions", async (req, res) => {
  try {
    await transactionModel.deleteAllTransactions();
    res.status(200).json({ message: "All transactions deleted." });
  } catch (err) {
    console.error("Error clearing transactions:", err);
    res.status(500).json({ error: "Something went wrong while clearing transactions." });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.listen(PORT, () => {
  console.log("Expense Tracker API running at http://localhost:" + PORT);
});

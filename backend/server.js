const express = require("express");
const cors = require("cors");
const { readData, writeData } = require("./data");

const app = express();
const PORT = 5000;

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

app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API is running. Try GET /api/transactions" });
});

app.get("/api/transactions", (req, res) => {
  const transactions = readData();
  res.status(200).json(transactions);
});

app.get("/api/transactions/:id", (req, res) => {
  const transactions = readData();
  const transaction = transactions.find((t) => t.id === req.params.id);

  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found." });
  }

  res.status(200).json(transaction);
});


app.post("/api/transactions", (req, res) => {
  const errors = validateTransaction(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors: errors });
  }

  const transactions = readData();

  const newTransaction = {
    id: Date.now().toString(),   
    name: req.body.name.trim(),
    amount: Number(req.body.amount),
    category: req.body.category,
    type: req.body.type,
    date: req.body.date
  };

  transactions.push(newTransaction);
  writeData(transactions);

  res.status(201).json(newTransaction);
});

app.put("/api/transactions/:id", (req, res) => {
  const errors = validateTransaction(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors: errors });
  }

  const transactions = readData();
  const index = transactions.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Transaction not found." });
  }

  transactions[index] = {
    id: req.params.id,
    name: req.body.name.trim(),
    amount: Number(req.body.amount),
    category: req.body.category,
    type: req.body.type,
    date: req.body.date
  };

  writeData(transactions);

  res.status(200).json(transactions[index]);
});

app.delete("/api/transactions/:id", (req, res) => {
  const transactions = readData();
  const index = transactions.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Transaction not found." });
  }

  const deleted = transactions.splice(index, 1)[0];
  writeData(transactions);

  res.status(200).json({ message: "Transaction deleted.", deleted: deleted });
});

app.delete("/api/transactions", (req, res) => {
  writeData([]);
  res.status(200).json({ message: "All transactions deleted." });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.listen(PORT, () => {
  console.log("Expense Tracker API running at http://localhost:" + PORT);
});
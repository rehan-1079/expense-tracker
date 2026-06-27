const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "transactions.json");

function ensureDataFileExists() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

function readData() {
  ensureDataFileExists();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Could not parse transactions.json, starting empty.", err);
    return [];
  }
}

function writeData(transactions) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(transactions, null, 2));
}

module.exports = { readData, writeData };
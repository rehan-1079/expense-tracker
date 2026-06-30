# Expense Tracker — Backend API (PostgreSQL version)

This is the database-connected version of the Expense Tracker backend.
Instead of saving transactions to a JSON file, all data is now stored
in a real **PostgreSQL** database.

---

## 1. What changed from the file-based version

| File                  | Purpose                                              |
|-----------------------|-------------------------------------------------------|
| `db.js`               | Sets up the connection pool to PostgreSQL             |
| `initDb.js`           | One-time script that creates the `transactions` table |
| `transactionModel.js` | All SQL queries (CRUD) live here                      |
| `server.js`           | Express routes — now calls `transactionModel.js` instead of reading/writing a JSON file |

`data.js` and `transactions.json` from the old version are no longer
used and can be deleted.

---

## 2. Database Schema

One table: **`transactions`**

| Column      | Type            | Notes                                      |
|-------------|-----------------|---------------------------------------------|
| `id`        | `SERIAL`        | Primary key, auto-increments                |
| `name`      | `VARCHAR(60)`   | Required                                    |
| `amount`    | `NUMERIC(12,2)` | Required, must be greater than 0 (`CHECK`)  |
| `type`      | `VARCHAR(10)`   | Must be `'income'` or `'expense'` (`CHECK`) |
| `category`  | `VARCHAR(30)`   | Required                                    |
| `date`      | `DATE`          | Required                                    |
| `created_at`| `TIMESTAMP`     | Set automatically when the row is created   |

```sql
CREATE TABLE transactions (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(60) NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  type        VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  category    VARCHAR(30) NOT NULL,
  date        DATE NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Why a `CHECK` constraint as well as backend validation?** The Express
routes in `server.js` validate the data first and return clear error
messages like `"Amount must be greater than 0."`. The database's own
`CHECK` constraints are a second, independent safety net — if any bad
data ever reached the database some other way, PostgreSQL itself would
still refuse to store it.

**Why `NUMERIC` instead of a plain number type?** Money should never
use floating point types like `FLOAT`/`REAL`, since they can introduce
tiny rounding errors (e.g. `0.1 + 0.2` not exactly equaling `0.3`).
`NUMERIC(12, 2)` stores exact decimal values instead, which matters for
financial data.

---

## 3. Setup Instructions

### Step 1 — Install PostgreSQL

If you don't already have it installed:
- **Windows/Mac**: download from [postgresql.org/download](https://www.postgresql.org/download/)
- **Linux**: `sudo apt install postgresql`

Make sure the PostgreSQL service is running.

### Step 2 — Create the database

Open `psql` (PostgreSQL's command line tool) or a GUI tool like
pgAdmin, and run:

```sql
CREATE DATABASE expense_tracker;
```

### Step 3 — Configure your connection

Copy `.env.example` to a new file named `.env`:

```bash
cp .env.example .env
```

Open `.env` and fill in your own PostgreSQL username/password:

```
DB_USER=postgres
DB_PASSWORD=your_actual_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_tracker
PORT=5000
```

### Step 4 — Install dependencies

```bash
npm install
```

### Step 5 — Create the table

Run this once:

```bash
npm run init-db
```

You should see:
```
Connecting to database...
Success! The "transactions" table is ready.
```

### Step 6 — Start the server

```bash
npm start
```

```
Expense Tracker API running at http://localhost:5000
```

---

## 4. API Endpoints

Same endpoints as before — only the storage underneath changed.

| Method | Endpoint                  | Description                     |
|--------|----------------------------|----------------------------------|
| GET    | `/api/transactions`        | Get all transactions            |
| GET    | `/api/transactions/:id`    | Get a single transaction by id  |
| POST   | `/api/transactions`        | Add a new transaction           |
| PUT    | `/api/transactions/:id`    | Update an existing transaction  |
| DELETE | `/api/transactions/:id`    | Delete a single transaction     |
| DELETE | `/api/transactions`        | Delete all transactions         |

**Important change:** `id` is now a **number** (e.g. `5`), not a string
like in the old file-based version (e.g. `"id_1719300000000_42"`). This
is because the database auto-generates `id` as a `SERIAL` integer.

If you're using the matching frontend from this project, it already
handles this correctly — it compares ids with `==` instead of `===` in
the two places that needed it, since `data-id` attributes from the page
are always strings, but ids from the API are numbers, and `5 == "5"` is
`true` while `5 === "5"` is `false`.

---

## 5. Example Requests

```bash
# Get all transactions
curl http://localhost:5000/api/transactions

# Add a new transaction
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Lunch\",\"amount\":350,\"type\":\"expense\",\"category\":\"Food\",\"date\":\"2026-06-25\"}"

# Update a transaction (use the id returned from the POST above)
curl -X PUT http://localhost:5000/api/transactions/1 \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Lunch updated\",\"amount\":400,\"type\":\"expense\",\"category\":\"Food\",\"date\":\"2026-06-25\"}"

# Delete a transaction
curl -X DELETE http://localhost:5000/api/transactions/1

# Delete everything
curl -X DELETE http://localhost:5000/api/transactions
```

---

## 6. Validation & Error Handling

Validation happens at two levels:

1. **In `server.js`**, before any database query runs — checks for
   missing fields, wrong types, invalid categories, etc. Returns `400`
   with a list of specific error messages.
2. **In the database itself**, via `CHECK` constraints — a backup in
   case bad data somehow skips the first check.

There's also an `isValidId()` check before any query that uses an `:id`
from the URL, so requests like `GET /api/transactions/abc` return a
clean `400 Invalid transaction id.` instead of a confusing database
error.

| Code | Meaning                                          |
|------|---------------------------------------------------|
| 200  | Success (GET, PUT, DELETE)                        |
| 201  | Created successfully (POST)                       |
| 400  | Validation failed, or invalid id format            |
| 404  | Transaction not found / unknown route              |
| 500  | Unexpected server/database error                  |

---

## 7. Troubleshooting

**"Could not connect to server" in the frontend / connection refused**
→ Make sure PostgreSQL itself is running, and that you ran `npm start`
in this folder (not just created the database).

**"relation \"transactions\" does not exist"**
→ You forgot to run `npm run init-db`, or you ran it against a
different database than the one your `.env` points to.

**"password authentication failed for user"**
→ Double check `DB_USER` and `DB_PASSWORD` in your `.env` match what
you actually set up in PostgreSQL.

**Want to start over with an empty table?**
```sql
DROP TABLE transactions;
```
then run `npm run init-db` again.

const form = document.getElementById("transaction-form");
const transactionName = document.getElementById("transaction-name");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

const transactionList = document.getElementById("transaction-list");
const emptyState = document.getElementById("empty-state");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveTransactions() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}

function updateSummary() {
    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {
        if (transaction.type === "income") {
            income += transaction.amount;
        } else {
            expense += transaction.amount;
        }
    });

    const balance = income - expense;

    balanceEl.textContent = `PKR ${balance}`;
    incomeEl.textContent = `PKR ${income}`;
    expenseEl.textContent = `PKR ${expense}`;
}

function renderTransactions() {

    transactionList.innerHTML = "";

    if (transactions.length === 0) {

        transactionList.innerHTML = `
            <li id="empty-state">
                No transactions found.
                Add your first transaction.
            </li>
        `;

        updateSummary();
        return;
    }

    transactions.forEach(transaction => {

        const item = document.createElement("li");

        item.classList.add("transaction-item");

        item.innerHTML = `
            <span>${transaction.name}</span>

            <span class="${transaction.type}">
                ${transaction.type === "income" ? "+" : "-"}
                PKR ${transaction.amount}
            </span>

            <button
                class="delete-btn"
                data-id="${transaction.id}">
                Delete
            </button>
        `;

        transactionList.appendChild(item);
    });

    updateSummary();
}

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = transactionName.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;

    if (
        name === "" ||
        amount <= 0 ||
        type === ""
    ) {
        alert("Please fill all fields correctly.");
        return;
    }

    const newTransaction = {
        id: Date.now(),
        name,
        amount,
        type
    };

    transactions.push(newTransaction);

    saveTransactions();
    renderTransactions();

    form.reset();
});

transactionList.addEventListener("click", function (event) {

    if (
        event.target.classList.contains("delete-btn")
    ) {

        const id = Number(
            event.target.dataset.id
        );

        transactions = transactions.filter(
            transaction => transaction.id !== id
        );

        saveTransactions();
        renderTransactions();
    }
});

renderTransactions();
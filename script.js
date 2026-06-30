const CURRENCY = "PKR";

const API_URL = "http://localhost:5000/api/transactions";

const CATEGORIES = {
  income: ["Salary", "Freelance", "Business", "Investment", "Other"],
  expense: ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"]
};

let transactions = [];  
let editId = null;      
let deleteId = null;     

const transactionForm = document.getElementById("transactionForm");
const editIdInput = document.getElementById("editId");
const typeIncome = document.getElementById("typeIncome");
const typeExpense = document.getElementById("typeExpense");
const nameInput = document.getElementById("transName");
const amountInput = document.getElementById("transAmount");
const dateInput = document.getElementById("transDate");
const categorySelect = document.getElementById("transCategory");

const nameError = document.getElementById("nameError");
const amountError = document.getElementById("amountError");
const dateError = document.getElementById("dateError");
const categoryError = document.getElementById("categoryError");

const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const balanceValue = document.getElementById("balanceValue");
const incomeValue = document.getElementById("incomeValue");
const expenseValue = document.getElementById("expenseValue");

const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");
const sortOrder = document.getElementById("sortOrder");

const transactionList = document.getElementById("transactionList");
const emptyMsg = document.getElementById("emptyMsg");

const statTotal = document.getElementById("statTotal");
const statMonthlyIncome = document.getElementById("statMonthlyIncome");
const statMonthlySpending = document.getElementById("statMonthlySpending");
const statSavings = document.getElementById("statSavings");

const expenseBreakdown = document.getElementById("expenseBreakdown");
const breakdownEmptyMsg = document.getElementById("breakdownEmptyMsg");

const exportBtn = document.getElementById("exportBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

const deleteModal = document.getElementById("deleteModal");
const deleteModalText = document.getElementById("deleteModalText");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const clearAllModal = document.getElementById("clearAllModal");
const cancelClearBtn = document.getElementById("cancelClearBtn");
const confirmClearBtn = document.getElementById("confirmClearBtn");

const toast = document.getElementById("toast");

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

async function fetchTransactions() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Server responded with status " + response.status);
    }
    return await response.json();
  } catch (err) {
    console.error("Could not load transactions from server:", err);
    showToast("Could not connect to server. Is the backend running?", true);
    return [];
  }
}

async function createTransactionOnServer(data) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      const message = result.errors ? result.errors.join(" ") : "Could not add transaction.";
      showToast(message, true);
      return null;
    }

    return result;
  } catch (err) {
    console.error("Could not add transaction:", err);
    showToast("Could not connect to server. Is the backend running?", true);
    return null;
  }
}

async function updateTransactionOnServer(id, data) {
  try {
    const response = await fetch(API_URL + "/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      const message = result.errors ? result.errors.join(" ") : "Could not update transaction.";
      showToast(message, true);
      return null;
    }

    return result;
  } catch (err) {
    console.error("Could not update transaction:", err);
    showToast("Could not connect to server. Is the backend running?", true);
    return null;
  }
}

async function deleteTransactionOnServer(id) {
  try {
    const response = await fetch(API_URL + "/" + id, { method: "DELETE" });
    if (!response.ok) {
      showToast("Could not delete transaction.", true);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Could not delete transaction:", err);
    showToast("Could not connect to server. Is the backend running?", true);
    return false;
  }
}

async function clearAllTransactionsOnServer() {
  try {
    const response = await fetch(API_URL, { method: "DELETE" });
    if (!response.ok) {
      showToast("Could not clear transactions.", true);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Could not clear transactions:", err);
    showToast("Could not connect to server. Is the backend running?", true);
    return false;
  }
}

function formatMoney(amount) {
  const value = Math.abs(amount);
  return CURRENCY + " " + value.toLocaleString("en-PK", { maximumFractionDigits: 2 });
}

function formatMoneySigned(amount) {
  if (amount < 0) {
    return "-" + formatMoney(amount);
  }
  return formatMoney(amount);
}

function getTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return yyyy + "-" + mm + "-" + dd;
}

function showToast(message, isError) {
  toast.textContent = message;
  toast.className = "toast show" + (isError ? " error" : "");

  setTimeout(function () {
    toast.className = "toast";
  }, 2500);
}

function validateForm() {
  let isValid = true;

  if (nameInput.value.trim() === "") {
    nameError.textContent = "Please enter a transaction name.";
    nameInput.classList.add("invalid");
    isValid = false;
  } else {
    nameError.textContent = "";
    nameInput.classList.remove("invalid");
  }

  const amount = Number(amountInput.value);
  if (amountInput.value === "" || isNaN(amount)) {
    amountError.textContent = "Please enter an amount.";
    amountInput.classList.add("invalid");
    isValid = false;
  } else if (amount <= 0) {
    amountError.textContent = "Amount must be greater than 0.";
    amountInput.classList.add("invalid");
    isValid = false;
  } else {
    amountError.textContent = "";
    amountInput.classList.remove("invalid");
  }

  if (dateInput.value === "") {
    dateError.textContent = "Please select a date.";
    dateInput.classList.add("invalid");
    isValid = false;
  } else {
    dateError.textContent = "";
    dateInput.classList.remove("invalid");
  }

  if (categorySelect.value === "") {
    categoryError.textContent = "Please select a category.";
    categorySelect.classList.add("invalid");
    isValid = false;
  } else {
    categoryError.textContent = "";
    categorySelect.classList.remove("invalid");
  }

  return isValid;
}

function updateCategoryOptions() {
  const type = typeExpense.checked ? "expense" : "income";
  const categories = CATEGORIES[type];

  categorySelect.innerHTML = '<option value="">Select category</option>';

  for (let i = 0; i < categories.length; i++) {
    const option = document.createElement("option");
    option.value = categories[i];
    option.textContent = categories[i];
    categorySelect.appendChild(option);
  }
}

function updateFilterCategoryOptions() {
  const allCategories = [...new Set([...CATEGORIES.income, ...CATEGORIES.expense])].sort();

  filterCategory.innerHTML = '<option value="all">All Categories</option>';

  for (let i = 0; i < allCategories.length; i++) {
    const option = document.createElement("option");
    option.value = allCategories[i];
    option.textContent = allCategories[i];
    filterCategory.appendChild(option);
  }
}

async function addTransaction(data) {
  const saved = await createTransactionOnServer(data);
  if (!saved) return; 

  transactions = await fetchTransactions();
  renderEverything();
  showToast("Transaction added successfully.");
}

async function updateTransactionById(id, data) {
  const saved = await updateTransactionOnServer(id, data);
  if (!saved) return;

  transactions = await fetchTransactions();
  renderEverything();
  showToast("Transaction updated successfully.");
}

async function deleteTransactionById(id) {
  const success = await deleteTransactionOnServer(id);
  if (!success) return;

  transactions = await fetchTransactions();
  renderEverything();
  showToast("Transaction deleted.");
}

async function clearAllTransactions() {
  const success = await clearAllTransactionsOnServer();
  if (!success) return;

  transactions = [];
  renderEverything();
  showToast("All transactions cleared.");
}

function getVisibleTransactions() {
  const searchText = searchInput.value.trim().toLowerCase();
  const typeValue = filterType.value;
  const categoryValue = filterCategory.value;
  const sortValue = sortOrder.value;

  let result = transactions.filter(function (t) {
    const matchesSearch =
      t.name.toLowerCase().includes(searchText) ||
      t.category.toLowerCase().includes(searchText);
    const matchesType = typeValue === "all" || t.type === typeValue;
    const matchesCategory = categoryValue === "all" || t.category === categoryValue;
    return matchesSearch && matchesType && matchesCategory;
  });

  if (sortValue === "newest") {
    result.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
  } else {
    result.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
  }

  return result;
}

function renderSummary() {
  let totalIncome = 0;
  let totalExpense = 0;

  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].type === "income") {
      totalIncome += transactions[i].amount;
    } else {
      totalExpense += transactions[i].amount;
    }
  }

  const balance = totalIncome - totalExpense;

  balanceValue.textContent = formatMoneySigned(balance);
  incomeValue.textContent = formatMoney(totalIncome);
  expenseValue.textContent = formatMoney(totalExpense);

  const balanceCard = balanceValue.closest(".card");
  if (balance < 0) {
    balanceCard.classList.add("negative");
  } else {
    balanceCard.classList.remove("negative");
  }
}

function createTransactionHTML(t) {
  const sign = t.type === "income" ? "+" : "-";
  const badgeClass = t.type === "income" ? "badge-income" : "badge-expense";

  return (
    '<li class="transaction-item ' + t.type + '" data-id="' + t.id + '">' +
      '<div class="transaction-info">' +
        '<div class="transaction-name">' + escapeText(t.name) + "</div>" +
        '<div class="transaction-meta">' +
          '<span class="badge ' + badgeClass + '">' + t.type + "</span>" +
          escapeText(t.category) + " &middot; " + t.date +
        "</div>" +
      "</div>" +
      '<div class="transaction-amount">' + sign + " " + formatMoney(t.amount) + "</div>" +
      '<div class="transaction-actions">' +
        '<button type="button" class="edit-btn" data-id="' + t.id + '">Edit</button>' +
        '<button type="button" class="delete-btn" data-id="' + t.id + '">Delete</button>' +
      "</div>" +
    "</li>"
  );
}

function escapeText(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderTransactionList() {
  const visible = getVisibleTransactions();

  if (visible.length === 0) {
    transactionList.innerHTML = "";
    emptyMsg.style.display = "block";
    if (transactions.length === 0) {
      emptyMsg.textContent = "No transactions yet. Add one above to get started.";
    } else {
      emptyMsg.textContent = "No transactions match your search/filters.";
    }
    return;
  }

  emptyMsg.style.display = "none";

  let html = "";
  for (let i = 0; i < visible.length; i++) {
    html += createTransactionHTML(visible[i]);
  }
  transactionList.innerHTML = html;
}

function renderStatistics() {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  let monthlyIncome = 0;
  let monthlySpending = 0;

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    const tDate = new Date(t.date);

    if (tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear) {
      if (t.type === "income") {
        monthlyIncome += t.amount;
      } else {
        monthlySpending += t.amount;
      }
    }
  }

  statTotal.textContent = transactions.length;
  statMonthlyIncome.textContent = formatMoney(monthlyIncome);
  statMonthlySpending.textContent = formatMoney(monthlySpending);
  statSavings.textContent = formatMoneySigned(monthlyIncome - monthlySpending);
}

function renderExpenseBreakdown() {
  const expenseTransactions = transactions.filter(function (t) {
    return t.type === "expense";
  });

  if (expenseTransactions.length === 0) {
    expenseBreakdown.innerHTML = '<p class="empty-msg" id="breakdownEmptyMsg">No expenses recorded yet.</p>';
    return;
  }

  const totalsByCategory = {};
  let grandTotal = 0;

  for (let i = 0; i < expenseTransactions.length; i++) {
    const t = expenseTransactions[i];
    totalsByCategory[t.category] = (totalsByCategory[t.category] || 0) + t.amount;
    grandTotal += t.amount;
  }

  const categories = Object.keys(totalsByCategory).sort(function (a, b) {
    return totalsByCategory[b] - totalsByCategory[a];
  });

  let html = "";
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const amount = totalsByCategory[category];
    const percent = Math.round((amount / grandTotal) * 100);

    html +=
      '<div class="breakdown-row">' +
        '<div class="breakdown-row-top">' +
          "<span>" + escapeText(category) + "</span>" +
          "<span>" + formatMoney(amount) + " (" + percent + "%)</span>" +
        "</div>" +
        '<div class="breakdown-bar-track">' +
          '<div class="breakdown-bar-fill" style="width:' + percent + '%"></div>' +
        "</div>" +
      "</div>";
  }

  expenseBreakdown.innerHTML = html;
}

function renderEverything() {
  renderSummary();
  renderTransactionList();
  renderStatistics();
  renderExpenseBreakdown();
}

function exportToCSV() {
  if (transactions.length === 0) {
    showToast("No transactions to export.", true);
    return;
  }

  let csv = "Name,Amount,Category,Type,Date\n";

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    csv += '"' + t.name.replace(/"/g, '""') + '",' + t.amount + "," + t.category + "," + t.type + "," + t.date + "\n";
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "transactions.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("CSV file downloaded.");
}

function startEdit(id) {
  const transaction = transactions.find(function (t) {
    return t.id == id;
  });
  if (!transaction) return;

  editId = id;
  editIdInput.value = id;

  if (transaction.type === "income") {
    typeIncome.checked = true;
  } else {
    typeExpense.checked = true;
  }
  updateCategoryOptions();

  nameInput.value = transaction.name;
  amountInput.value = transaction.amount;
  dateInput.value = transaction.date;
  categorySelect.value = transaction.category;

  submitBtn.textContent = "Save Changes";
  cancelEditBtn.style.display = "inline-block";

  document.getElementById("add-transaction").scrollIntoView({ behavior: "smooth" });
}

function cancelEdit() {
  editId = null;
  editIdInput.value = "";
  transactionForm.reset();
  typeIncome.checked = true;
  updateCategoryOptions();
  dateInput.value = getTodayDate();

  submitBtn.textContent = "Add Transaction";
  cancelEditBtn.style.display = "none";

  nameError.textContent = "";
  amountError.textContent = "";
  dateError.textContent = "";
  categoryError.textContent = "";
}

function openModal(modal) {
  modal.hidden = false;
}

function closeModal(modal) {
  modal.hidden = true;
}

typeIncome.addEventListener("change", updateCategoryOptions);
typeExpense.addEventListener("change", updateCategoryOptions);

transactionForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!validateForm()) {
    showToast("Please fix the errors in the form.", true);
    return;
  }

  const data = {
    type: typeExpense.checked ? "expense" : "income",
    name: nameInput.value.trim(),
    amount: amountInput.value,
    date: dateInput.value,
    category: categorySelect.value
  };

  submitBtn.disabled = true;

  if (editId) {
    await updateTransactionById(editId, data);
  } else {
    await addTransaction(data);
  }

  submitBtn.disabled = false;
  cancelEdit(); 
});

cancelEditBtn.addEventListener("click", cancelEdit);

searchInput.addEventListener("input", renderTransactionList);
filterType.addEventListener("change", renderTransactionList);
filterCategory.addEventListener("change", renderTransactionList);
sortOrder.addEventListener("change", renderTransactionList);

transactionList.addEventListener("click", function (e) {
  const id = e.target.getAttribute("data-id");
  if (!id) return;

  if (e.target.classList.contains("edit-btn")) {
    startEdit(id);
  }

  if (e.target.classList.contains("delete-btn")) {
    deleteId = id;
    const transaction = transactions.find(function (t) { return t.id == id; });
    deleteModalText.textContent = transaction
      ? 'Delete "' + transaction.name + '"? This cannot be undone.'
      : "This cannot be undone.";
    openModal(deleteModal);
  }
});

cancelDeleteBtn.addEventListener("click", function () {
  deleteId = null;
  closeModal(deleteModal);
});

confirmDeleteBtn.addEventListener("click", async function () {
  if (deleteId) {
    await deleteTransactionById(deleteId);
    deleteId = null;
  }
  closeModal(deleteModal);
});

clearAllBtn.addEventListener("click", function () {
  if (transactions.length === 0) {
    showToast("There is nothing to clear.", true);
    return;
  }
  openModal(clearAllModal);
});

cancelClearBtn.addEventListener("click", function () {
  closeModal(clearAllModal);
});

confirmClearBtn.addEventListener("click", async function () {
  await clearAllTransactions();
  closeModal(clearAllModal);
});

exportBtn.addEventListener("click", exportToCSV);

menuBtn.addEventListener("click", function () {
  nav.classList.toggle("open");
});

async function init() {
  updateCategoryOptions();
  updateFilterCategoryOptions();
  dateInput.value = getTodayDate();

  emptyMsg.style.display = "block";
  emptyMsg.textContent = "Loading transactions...";

  transactions = await fetchTransactions();
  renderEverything();
}

init();
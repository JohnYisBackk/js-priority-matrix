"use strict";

// ======================================================
// SELECT ELEMENTS
// ======================================================

const themeBtn = document.getElementById("themeBtn");

const searchInput = document.getElementById("searchInput");
const navLinks = document.querySelectorAll(".nav-link");

const taskTitle = document.getElementById("taskTitle");
const categorySelect = document.getElementById("categorySelect");
const dateSelect = document.getElementById("dateSelect");
const completedCheckbox = document.getElementById("completedCheckbox");
const addTaskBtn = document.getElementById("addTaskBtn");

const totalTasks = document.getElementById("totalTasks");
const totalCompleted = document.getElementById("totalCompleted");
const totalInProgress = document.getElementById("totalInProgress");

const urgentImportantCount = document.getElementById("urgentImportantCount");
const importantCount = document.getElementById("importantCount");
const urgentCount = document.getElementById("urgentCount");
const laterCount = document.getElementById("laterCount");

const urgentImportantList = document.getElementById("urgentImportantList");
const importantList = document.getElementById("importantList");
const urgentList = document.getElementById("urgentList");
const laterList = document.getElementById("laterList");

const cardsSection = document.querySelector(".cards-section");

// ======================================================
// STATE
// ======================================================

let cards = [];

let currentTheme = "light";

let currentFilter = "all";

// ======================================================
// SAVE / LOAD DATA
// ======================================================

function saveData() {
  localStorage.setItem("priorityMatrix", JSON.stringify(cards));
}

function loadData() {
  const storedData = localStorage.getItem("priorityMatrix");

  if (!storedData) return;

  cards = JSON.parse(storedData);
}

// ======================================================
// THEME
// ======================================================

function loadTheme() {
  const storedTheme = localStorage.getItem("priorityMatrixTheme", currentTheme);

  if (!storedTheme) return;

  currentTheme = storedTheme;

  applyTheme();
}

function applyTheme() {
  document.documentElement.dataset.theme = currentTheme;
}

function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";

  applyTheme();

  localStorage.setItem("priorityMatrixTheme", currentTheme);
}

// ======================================================
// NAVIGATION / FILTERS
// ======================================================

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    navLinks.forEach((navLink) => {
      navLink.classList.remove("active");
    });

    link.classList.add("active");

    currentFilter = link.dataset.filter;

    renderTasks();
  });
});

// ======================================================
// ADD TASK & CLEAR INPUTS
// ======================================================

function addTask() {
  const title = taskTitle.value.trim();
  const category = categorySelect.value;
  const date = dateSelect.value;
  const completed = completedCheckbox.checked;

  if (!title || !category) {
    alert("Please fill all informations...");
    return;
  }

  const newTask = {
    id: Date.now(),
    title,
    category,
    date,
    completed,
  };

  cards.push(newTask);

  saveData();
  renderTasks();
  clearInputs();
}

function clearInputs() {
  taskTitle.value = "";
  categorySelect.value = "urgent-important";
  dateSelect.value = "";
  completedCheckbox = false;
}

// ======================================================
// RENDER TASKS
// ======================================================

function renderTasks() {
  urgentImportantList.innerHTML = "";
  importantList.innerHTML = "";
  urgentList.innerHTML = "";
  laterList.innerHTML = "";

  let filteredCards = [...cards];

  if (currentFilter === "completed") {
    filteredCards = cards.filter((card) => card.completed);
  }

  if (currentFilter === "today") {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const todayDate = `${year}-${month}-${day}`;

    filteredCards = cards.filter((card) => card.date === todayDate);
  }

  const searchTerm = searchInput.value.trim().toLowerCase();

  if (searchTerm) {
    filteredCards = filteredCards.filter((card) =>
      card.title.toLowerCase().includes(searchTerm),
    );
  }

  filteredCards.forEach((card) => {
    const taskItem = document.createElement("div");
    taskItem.classList.add("task-item");

    if (card.completed) {
      taskItem.classList.add("completed");
    }

    taskItem.dataset.id = card.id;

    const completeButton = document.createElement("button");
    completeButton.classList.add("task-complete-button");
    completeButton.dataset.id = card.id;

    completeButton.innerHTML = card.completed
      ? '<i class="bi bi-check-lg"></i>'
      : "";

    const taskContent = document.createElement("div");
    taskContent.classList.add("task-item-content");

    const title = document.createElement("p");
    title.classList.add("task-item-title");
    title.textContent = card.title;

    taskContent.appendChild(title);

    if (card.date) {
      const date = document.createElement("span");
      date.classList.add("task-item-date");

      date.innerHTML = '<i class="bi bi-calendar3"></i>';

      const dateText = document.createElement("span");
      dateText.textContent = card.date;

      date.appendChild(dateText);
      taskContent.appendChild(date);
    }

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-task-button");
    deleteButton.dataset.id = card.id;
    deleteButton.setAttribute("aria-label", "Delete task");

    deleteButton.innerHTML = '<i class="bi bi-trash3"></i>';

    taskItem.appendChild(completeButton);
    taskItem.appendChild(taskContent);
    taskItem.appendChild(deleteButton);

    if (card.category === "urgent-important") {
      urgentImportantList.appendChild(taskItem);
    } else if (card.category === "important") {
      importantList.appendChild(taskItem);
    } else if (card.category === "urgent") {
      urgentList.appendChild(taskItem);
    } else if (card.category === "later") {
      laterList.appendChild(taskItem);
    }
  });

  updateOverview();
  updateCategoryCounts();
}

// ======================================================
// COMPLETE TASK
// ======================================================

function completeTask(id) {
  const card = cards.find((card) => card.id === id);

  if (!card) return;

  card.completed = !card.completed;

  saveData();
  renderTasks();
}

// ======================================================
// DELETE TASK
// ======================================================

function deleteTask(id) {
  cards = cards.filter((card) => card.id !== id);

  saveData();
  renderTasks();
}

// ======================================================
// SEARCH TASKS
// ======================================================

function searchTasks() {
  renderTasks();
}

// ======================================================
// UPDATE OVERVIEW
// ======================================================

function updateOverview() {
  const completedCards = cards.filter((card) => card.completed);
  const inProgressCards = cards.filter((card) => !card.completed);

  totalTasks.textContent = cards.length;
  totalCompleted.textContent = completedCards.length;
  totalInProgress.textContent = inProgressCards.length;
}

// ======================================================
// UPDATE CATEGORY COUNTS
// ======================================================

function updateCategoryCounts() {
  const urgentImportantCards = cards.filter(
    (card) => card.category === "urgent-important",
  );

  const importantCards = cards.filter((card) => card.category === "important");

  const urgentCards = cards.filter((card) => card.category === "urgent");

  const laterCards = cards.filter((card) => card.category === "later");

  urgentImportantCount.textContent = urgentImportantCards.length;
  importantCount.textContent = importantCards.length;
  urgentCount.textContent = urgentCards.length;
  laterCount.textContent = laterCards.length;
}

// ======================================================
// EVENT LISTENERS
// ======================================================

searchInput.addEventListener("input", searchTasks);

themeBtn.addEventListener("click", toggleTheme);

addTaskBtn.addEventListener("click", addTask);

cardsSection.addEventListener("click", (event) => {
  const completeButton = event.target.closest(".task-complete-button");
  const deleteButton = event.target.closest(".delete-task-button");

  if (completeButton) {
    const id = Number(completeButton.dataset.id);

    completeTask(id);
  }

  if (deleteButton) {
    const id = Number(deleteButton.dataset.id);

    deleteTask(id);
  }
});

// ======================================================
// INITIALIZE APP
// ======================================================

function init() {
  loadData();
  loadTheme();

  renderTasks();
}

init();

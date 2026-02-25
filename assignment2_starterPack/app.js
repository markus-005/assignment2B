import axios from "axios";

/* =========================
   CONFIG
========================= */
const API_BASE = "https://veff-2026-quotes.netlify.app/api/v1";
const LOCAL_API_BASE = "http://localhost:3000/api/v1";

/* =========================
   QUOTE FEATURE
========================= */

/**
 * Fetch a quote from the API
 * @param {string} category - quote category
 */
const loadQuote = async (category = "general") => {
   try{
   const quoteText = document.getElementById("quote-text");
   const quoteAuthor = document.getElementById("quote-author");

   if (!quoteText || !quoteAuthor) return;
   
   const res = await axios.get(API_BASE + "/quotes", { params: { category },})

   const quote = res.data.quote;
   const author = res.data.author;

   quoteText.textContent = '"' + quote + '"';
   quoteAuthor.textContent = author;
   }  catch (error) {
      console.error("Error fetching quote:", error);
   }
};

const wireQuoteEvents = () => {
   const select = document.getElementById("quote-category-select");
   const button = document.getElementById("new-quote-btn");

   if (!select || !button) return;

   button.addEventListener("click", () => {
      loadQuote(select.value);
   });

   select.addEventListener("change", () => {
      loadQuote(select.value);
   });
};

/* =========================
   TASK FEATURE
========================= */

const renderTasks = (tasks) => {
  const list = document.querySelector(".task-list");
  if (!list) return;

  list.innerHTML = "";

  tasks.forEach((t) => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = t.finished === 1;
    checkbox.id = `task-${t.id}`;

    checkbox.addEventListener("change", async () => {
      const newFinished = checkbox.checked ? 1 : 0;

      await updateTaskStatus(t.id, newFinished);

      await loadTasks();
    });

   checkbox.id = `task-${t.id}`;

   const label = document.createElement("label");
   label.textContent = t.task;
   label.htmlFor = checkbox.id;

   li.appendChild(checkbox);
   li.appendChild(label);
   list.appendChild(li);
  });
};

const loadTasks = async () => {
  try {
    const res = await axios.get(`${LOCAL_API_BASE}/tasks`);
    renderTasks(res.data); 
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

const updateTaskStatus = async (id, finished) => {
  try {
    await axios.patch(`${LOCAL_API_BASE}/tasks/${id}`, { finished });
  } catch (error) {
    console.error("Error updating task status:", error);
  }
};

const addTask = async (taskText) => {
  try {
    await axios.post(`${LOCAL_API_BASE}/tasks`, { task: taskText });
  } catch (error) {
    console.error("Error adding task:", error);
  }
};

const wireTaskEvents = () => {
   const input = document.getElementById("new-task");
   const button = document.getElementById("add-task-btn");

   if (!input || !button) return;

const submit = async () => {
   const text = input.value.trim();
   if (!text) return; 

   await addTask(text);

   input.value = "";    
   await loadTasks();   
  };

  button.addEventListener("click", submit);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });
};

/* =========================
   NOTE FEATURE
========================= */

let lastSavedNotes = "";

const loadNotes = async () => {
  try {
    const textarea = document.getElementById("notes-text");
    const saveBtn = document.getElementById("save-notes-btn");
    if (!textarea || !saveBtn) return;

    const res = await axios.get(`${LOCAL_API_BASE}/notes`);
    lastSavedNotes = res.data.notes ?? "";

    textarea.value = lastSavedNotes;
    saveBtn.disabled = true; 
  } catch (error) {
    console.error("Error loading notes:", error);
  }
};

const saveNotes = async (newNotes) => {
  try {
    const res = await axios.put(`${LOCAL_API_BASE}/notes`, { notes: newNotes });
    lastSavedNotes = res.data.notes ?? newNotes;
  } catch (error) {
    console.error("Error saving notes:", error);
  }
};

const wireNotesEvents = () => {
  const textarea = document.getElementById("notes-text");
  const saveBtn = document.getElementById("save-notes-btn");
  if (!textarea || !saveBtn) return;

  textarea.addEventListener("input", () => {
    saveBtn.disabled = textarea.value === lastSavedNotes;
  });

  saveBtn.addEventListener("click", async () => {
    await saveNotes(textarea.value);

    saveBtn.disabled = true;
  });
};


/* =========================
   INIT
========================= */

/**
 * Initialize application
 */
const init = async () => {
  wireQuoteEvents();
  wireTaskEvents();
  wireNotesEvents();

  const select = document.getElementById("quote-category-select");
  const category = select?.value || "general";

  await loadQuote(category);
  await loadTasks();
  await loadNotes();
};

/* =========================
   EXPORT (DO NOT REMOVE)
========================= */

export { init, loadQuote, wireQuoteEvents };

init();

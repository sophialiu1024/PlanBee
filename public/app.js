(function () {
  const API_BASE = window.location.protocol === "file:" ? "http://127.0.0.1:8000" : "";
  const taskList = document.querySelector("#task-list");
  const dialog = document.querySelector("#planner-dialog");
  const form = document.querySelector("#task-form");
  const titleInput = document.querySelector("#task-title");
  const dateInput = document.querySelector("#task-date");
  const importanceInput = document.querySelector("#task-importance");
  const status = document.querySelector("#dialog-status");
  const resultSection = document.querySelector("#ai-result-section");
  const result = document.querySelector("#ai-result");
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  const chatForm = document.querySelector("#chat-form");
  const chatInput = document.querySelector("#chat-input");
  const chatMessages = document.querySelector("#chat-messages");
  const chatSend = document.querySelector("#chat-send");
  const chatDialog = document.querySelector("#chat-dialog");

  let tasks = PlanBeeStorage.loadTasks();
  let chatHistory = [];

  function formatDate(date) {
    if (!date) return "No due date";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`));
  }

  function sortedTasks() {
    return [...tasks].sort((a, b) => priorityOrder[a.importance] - priorityOrder[b.importance] || a.dueDate.localeCompare(b.dueDate));
  }

  function renderTasks() {
    taskList.innerHTML = "";
    if (!tasks.length) {
      taskList.innerHTML = '<p class="empty-state">No assignments yet. Add one to build your plan.</p>';
      return;
    }
    sortedTasks().forEach((task) => {
      const card = document.createElement("article");
      card.className = "task-card";
      card.innerHTML = `<div class="task-check" aria-hidden="true"></div><div class="task-info"><h3></h3><p></p></div><span class="priority priority-${task.importance.toLowerCase()}">${task.importance}</span><button class="remove-task material-symbols-outlined" type="button" aria-label="Remove task">close</button>`;
      card.querySelector("h3").textContent = task.title;
      card.querySelector("p").textContent = `${task.sample ? "Demo task · " : ""}Due ${formatDate(task.dueDate)}`;
      card.querySelector(".remove-task").addEventListener("click", () => {
        tasks = tasks.filter((item) => item.id !== task.id);
        PlanBeeStorage.saveTasks(tasks);
        renderTasks();
      });
      taskList.appendChild(card);
    });
  }

  function openDialog() {
    status.textContent = "";
    if (!dateInput.value) dateInput.value = new Date().toISOString().slice(0, 10);
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    titleInput.focus();
  }

  function closeDialog() {
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
  }

  function showResult(text) {
    resultSection.hidden = false;
    result.innerHTML = "";
    text.split("\n").filter(Boolean).forEach((line) => {
      const item = document.createElement("p");
      item.innerHTML = `<span class="material-symbols-outlined result-icon">check_circle</span><span></span>`;
      item.lastElementChild.textContent = line.replace(/^[-•]\s*/, "").replace(/\*\*/g, "");
      result.appendChild(item);
    });
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function addChatMessage(role, text) {
    const message = document.createElement("div");
    message.className = `chat-message ${role === "user" ? "user-message" : "assistant-message"}`;
    if (role === "assistant") {
      message.innerHTML = '<span class="message-icon material-symbols-outlined">hive</span><p></p>';
      message.querySelector("p").textContent = text;
    } else {
      message.innerHTML = "<p></p>";
      message.querySelector("p").textContent = text;
    }
    chatMessages.appendChild(message);
    message.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function openChatDialog() {
    if (!chatDialog.open) chatDialog.showModal();
    chatInput.focus();
  }

  function closeChatDialog() {
    if (chatDialog.open) chatDialog.close();
  }

  document.querySelector("#open-planner").addEventListener("click", openDialog);
  document.querySelector("#open-add-task").addEventListener("click", openDialog);
  document.querySelector(".close-button").addEventListener("click", closeDialog);
  document.querySelector("#open-chat").addEventListener("click", openChatDialog);
  document.querySelector("#close-chat").addEventListener("click", closeChatDialog);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!titleInput.value.trim() || !dateInput.value) return;
    const newTask = PlanBeeStorage.addTask({ title: titleInput.value, dueDate: dateInput.value, importance: importanceInput.value });
    tasks = [...tasks, newTask];
    renderTasks();
    titleInput.value = "";
    status.textContent = "Added to your plan. Add another, or organize the list with AI.";
    titleInput.focus();
  });

  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;
    chatHistory.push({ role: "user", content: message });
    addChatMessage("user", message);
    chatInput.value = "";
    chatInput.disabled = true;
    chatSend.disabled = true;
    chatSend.innerHTML = '<span class="material-symbols-outlined">progress_activity</span> Thinking…';
    try {
      const response = await fetch(`${API_BASE}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, history: chatHistory, tasks }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The AI could not answer.");
      chatHistory.push({ role: "assistant", content: payload.answer });
      addChatMessage("assistant", payload.answer);
    } catch (error) {
      addChatMessage("assistant", error.message || "Please check your key and internet connection.");
    } finally {
      chatInput.disabled = false;
      chatSend.disabled = false;
      chatSend.innerHTML = '<span class="material-symbols-outlined">send</span> Send';
      chatInput.focus();
    }
  });

  document.querySelector("#ask-ai").addEventListener("click", async () => {
    if (!tasks.length) {
      status.textContent = "Add at least one task first.";
      return;
    }
    const button = document.querySelector("#ask-ai");
    button.disabled = true;
    button.textContent = "Thinking…";
    status.textContent = "PlanBee is organizing your tasks…";
    try {
      const response = await fetch(`${API_BASE}/api/plan`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tasks }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The AI could not answer.");
      closeDialog();
      showResult(payload.answer);
    } catch (error) {
      status.textContent = error.message || "Please check your key and internet connection.";
    } finally {
      button.disabled = false;
      button.innerHTML = '<span class="material-symbols-outlined">auto_awesome</span> Make my plan';
    }
  });

  renderTasks();
})();

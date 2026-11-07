(function () {
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

  let tasks = PlanBeeStorage.loadTasks();

  function formatDate(date) {
    if (!date) return "No due date";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`));
  }

  function sortedTasks() {
    return [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate) || priorityOrder[a.importance] - priorityOrder[b.importance]);
  }

  function renderTasks() {
    taskList.innerHTML = "";
    sortedTasks().forEach((task) => {
      const card = document.createElement("article");
      card.className = "task-card";
      card.innerHTML = `<div class="task-check" aria-hidden="true"></div><div class="task-info"><h3></h3><p></p></div><span class="priority priority-${task.importance.toLowerCase()}">${task.importance}</span><button class="remove-task" type="button" aria-label="Remove task">×</button>`;
      card.querySelector("h3").textContent = task.title;
      card.querySelector("p").textContent = `Due ${formatDate(task.dueDate)}`;
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
    dialog.showModal();
    titleInput.focus();
  }

  function closeDialog() {
    dialog.close();
  }

  function showResult(text) {
    resultSection.hidden = false;
    result.innerHTML = "";
    text.split("\n").filter(Boolean).forEach((line) => {
      const item = document.createElement("p");
      item.textContent = line.replace(/^[-•]\s*/, "");
      result.appendChild(item);
    });
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelector("#open-planner").addEventListener("click", openDialog);
  document.querySelector("#open-add-task").addEventListener("click", openDialog);

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
      const response = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tasks }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The AI could not answer.");
      closeDialog();
      showResult(payload.answer);
    } catch (error) {
      status.textContent = error.message || "Please check your key and internet connection.";
    } finally {
      button.disabled = false;
      button.textContent = "✦ Organize with AI";
    }
  });

  renderTasks();
})();

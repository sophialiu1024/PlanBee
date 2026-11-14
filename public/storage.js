(function () {
  const STORAGE_KEY = "planbee.tasks.v2";

  function sampleTasks() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const date = (value) => value.toISOString().slice(0, 10);
    return [
      { id: "sample-science", title: "Finish science lab notes", dueDate: date(today), importance: "High", sample: true },
      { id: "sample-math", title: "Practice math problems", dueDate: date(today), importance: "Medium", sample: true },
      { id: "sample-history", title: "Read the history chapter", dueDate: date(tomorrow), importance: "Low", sample: true },
    ];
  }

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        const samples = sampleTasks();
        saveTasks(samples);
        return samples;
      }
      const saved = JSON.parse(raw);
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function addTask(task) {
    const tasks = loadTasks();
    const nextTask = { id: `task-${Date.now()}`, title: task.title.trim(), dueDate: task.dueDate, importance: task.importance, createdAt: new Date().toISOString() };
    tasks.push(nextTask);
    saveTasks(tasks);
    return nextTask;
  }

  function removeTask(id) {
    saveTasks(loadTasks().filter((task) => task.id !== id));
  }

  window.PlanBeeStorage = { loadTasks, saveTasks, addTask, removeTask };
})();

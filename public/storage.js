(function () {
  const STORAGE_KEY = "planbee.tasks.v1";

  const sampleTasks = [
    { id: "sample-science", title: "Finish science lab report", dueDate: "2026-11-08", importance: "High", createdAt: "2026-11-07T16:00:00.000Z" },
    { id: "sample-math", title: "Complete math practice set", dueDate: "2026-11-09", importance: "Medium", createdAt: "2026-11-07T16:00:00.000Z" },
    { id: "sample-reading", title: "Read the next history chapter", dueDate: "2026-11-12", importance: "Low", createdAt: "2026-11-07T16:00:00.000Z" }
  ];

  function loadTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) && saved.length ? saved : sampleTasks;
    } catch (error) {
      return sampleTasks;
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

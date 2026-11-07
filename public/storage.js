(function () {
  const STORAGE_KEY = "planbee.tasks.v2";

  function loadTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
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

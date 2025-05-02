function getTaskListIds() {
  var taskLists = Tasks.Tasklists.list(); // Получаем все списки задач
  if (taskLists.items && taskLists.items.length > 0) {
    taskLists.items.forEach(function(list) {
      Logger.log("Task List Name: " + list.title + ", ID: " + list.id);
    });
  } else {
    Logger.log("Нет доступных списков задач.");
  }
}

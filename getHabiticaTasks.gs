function getHabiticaTasks() {
  var habiticaTasksResponse = UrlFetchApp.fetch("https://habitica.com/api/v3/tasks/user", {
    method: "get",
    headers: {
      "x-api-user": habId,
      "x-api-key": habToken
    }
  });

  // Обрабатываем ответ
  var tasks = JSON.parse(habiticaTasksResponse.getContentText()).data;

  if (tasks.length === 0) {
    Logger.log("Нет задач в Habitica.");
    return;
  }

  // Перебираем все задачи и выводим их в лог
  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];
    Logger.log("Задача: " + task.text);
    Logger.log("Описание: " + (task.notes || "Нет описания"));
    Logger.log("Дата выполнения: " + (task.date || "Нет даты выполнения"));
    Logger.log(task)

  }
}

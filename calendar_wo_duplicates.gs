// 🔐 Habitica API credentials
var habId = "#userID#";
var habToken = "#userToken#";

function scheduleToDos() {
  // Получаем все задачи из Habitica
  var habiticaTasksResponse = UrlFetchApp.fetch("https://habitica.com/api/v3/tasks/user", {
    method: "get",
    headers: {
      "x-api-user": habId,
      "x-api-key": habToken
    }
  });

  var existingTasks = JSON.parse(habiticaTasksResponse.getContentText()).data;

  // Собираем ID задач, уже синхронизированных
  var syncedIds = new Set();
  for (var i = 0; i < existingTasks.length; i++) {
    var notes = existingTasks[i].notes || "";
    var match = notes.match(/\[SyncedFromGoogleTasks:id=(.+?)\]/);
    if (match) {
      syncedIds.add(match[1]);
    }
  }

  // Получаем списки задач Google Tasks
  var taskLists = Tasks.Tasklists.list();

  for (var i = 0; i < taskLists.items.length; i++) {
    var list = taskLists.items[i];
    var tasks = Tasks.Tasks.list(list.id);

    if (!tasks.items) continue;

    for (var j = 0; j < tasks.items.length; j++) {
      var task = tasks.items[j];

      // Пропустить завершённые и удалённые
      if (task.status === "completed" || task.deleted) continue;

      var taskId = task.id;
      if (syncedIds.has(taskId)) {
        Logger.log("Уже синхронизировано: " + task.title);
        continue;
      }

      var notes = (task.notes || "") + `\n[SyncedFromGoogleTasks:id=${taskId}]`;

      // Подготовка тела запроса
      var taskPayload = {
        text: task.title ? task.title.toString() : "Без названия",
        type: "todo",
        notes: notes.toString(),
        priority: 1.5
      };

      var options = {
        method: "post",
        contentType: "application/json", // Обязательно для JSON
        headers: {
          "x-api-user": habId,
          "x-api-key": habToken
        },
        payload: JSON.stringify(taskPayload),
        muteHttpExceptions: true // Позволяет получить ответ даже при ошибке
      };

      Logger.log("⏳ Отправка задачи в Habitica: " + JSON.stringify(taskPayload));

      try {
        var response = UrlFetchApp.fetch("https://habitica.com/api/v3/tasks/user", options);
        Logger.log("📩 Ответ от Habitica: " + response.getContentText());

        if (response.getResponseCode() === 201 || response.getResponseCode() === 200) {
          Logger.log("✅ Задача добавлена: " + task.title);
        } else {
          Logger.log("⚠️ Не удалось добавить задачу: " + task.title);
        }
      } catch (e) {
        Logger.log("❌ Исключение при добавлении задачи '" + task.title + "': " + e.message);
      }
    }
  }
}




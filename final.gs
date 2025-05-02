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

      // Получаем дату и время выполнения задачи (если оно есть)
      var dueDate = task.due ? new Date(task.due) : null;

      // Если дата есть, преобразуем её в локальное время (с учетом смещения +3)
      var dueFormatted = null;
      var dueFormattedForTitle = null;

      if (dueDate) {
        // Получаем UTC-время и добавляем смещение для MSK (+3)
        var localDate = new Date(dueDate.getTime() + (8 * 60 * 60 * 1000));  // Смещение на +3 часа

        // Форматируем дату в ISO для Habitica
        dueFormatted = localDate.toISOString();

        // Форматируем время и дату для названия задачи
        var hours = localDate.getHours().toString().padStart(2, '0');
        var minutes = localDate.getMinutes().toString().padStart(2, '0');
        var day = localDate.getDate().toString().padStart(2, '0');
        var month = (localDate.getMonth() + 1).toString().padStart(2, '0');
        var year = localDate.getFullYear();
        
        dueFormattedForTitle = `до ${hours}:${minutes} ${day}.${month}.${year}`;
      }

      // Форматируем название задачи с учетом времени и даты
      var taskTitleWithDate = task.title + (dueFormattedForTitle ? ` (${dueFormattedForTitle})` : "");

      // Подготовка тела запроса для Habitica
      var taskPayload = {
        text: taskTitleWithDate,  // Название задачи с добавленной датой и временем
        type: "todo",
        notes: notes.toString(),
        priority: 1.5,
        date: dueFormatted // Переносим дату в Habitica
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

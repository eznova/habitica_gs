function scheduleToDos() {
 var habId = "#userID#";
 var habToken = "6d739cbb-42cc-47fb-b822-0e8d34392cb2";

 // Получаем все списки задач
 var taskLists = Tasks.Tasklists.list();

 for (var i = 0; i < taskLists.items.length; i++) {
   var list = taskLists.items[i];
   var tasks = Tasks.Tasks.list(list.id);

   if (!tasks.items) continue;

   for (var j = 0; j < tasks.items.length; j++) {
     var task = tasks.items[j];

     // Пропускаем завершённые и удалённые задачи
     if (task.status === "completed" || task.deleted) continue;

     var params = {
       "method": "post",
       "headers": {
         "x-api-user": habId,
         "x-api-key": habToken,
         "Content-Type": "application/json"
       },
       "payload": JSON.stringify({
         "text": task.title,
         "type": "todo",
         "notes": task.notes || "",
         "priority": 1.5
       })
     };

     try {
       var response = UrlFetchApp.fetch("https://habitica.com/api/v3/tasks/user", params);
       Logger.log("Задача добавлена: " + task.title);
     } catch (e) {
       Logger.log("Ошибка при добавлении задачи '" + task.title + "': " + e.message);
     }
   }
 }
}
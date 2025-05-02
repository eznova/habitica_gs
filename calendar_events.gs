function scheduleToDos() {
  var habId = "#userID#";
  var habToken = "6d739cbb-42cc-47fb-b822-0e8d34392cb2";
 
  var now = new Date();
  var events = CalendarApp.getCalendarsByName("e.znova")[0].getEventsForDay(now);
 
  var paramsTemplate = {
    "method" : "post",
    "headers" : {
      "x-api-user" : habId, 
      "x-api-key" : habToken
    }
  }
 
  for (i = 0; i < events.length; i++) {
    var params = paramsTemplate;
    params["payload"] = {
      "text" : events[i].getTitle(), 
      "type" : "todo",
      "notes" : events[i].getDescription(),
      "priority" : "1.5"
    }
 
    UrlFetchApp.fetch("https://habitica.com/api/v3/tasks/user", params)
  } 
}







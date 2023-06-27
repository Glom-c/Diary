
var calendar = $("#calendar");
var todayInfo = $("#today-info");

// Get current date
var currentDate = new Date();
// Get the name of the month in Chinese
function getMonthName(date) {
  var months = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ];
  return months[date.getMonth()];
}
function renderCalendar(date) {
  // Clear existing calendar
  calendar.empty();

  // Create table structure
  var table = $("<table>");
  var headerRow = $("<tr>");
  var daysRow = $("<tr>");

  // Add previous month arrow
  var prevMonthArrow = $("<th>").text("<").addClass("prev-month");
  headerRow.append(prevMonthArrow);

  // Add current month and year
  var monthYear = $("<th>")
      .attr("colspan", "5")
      .text(getMonthName(date) + " " + date.getFullYear());
  headerRow.append(monthYear);

  // Add next month arrow
  var nextMonthArrow = $("<th>").text(">").addClass("next-month");
  headerRow.append(nextMonthArrow);

  // Add day names in Chinese
  var days = ["日", "一", "二", "三", "四", "五", "六"];
  for (var i = 0; i < days.length; i++) {
    var day = $("<th>").text(days[i]);
    daysRow.append(day);
  }

  table.append(headerRow, daysRow);

  // Get the first day of the month
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

  // Get the last day of the month
  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  // Calculate the number of days in the month
  var numDays = lastDay.getDate();

  // Calculate the index of the first day
  var startIdx = firstDay.getDay();

  // Calculate the index of the last day
  var endIdx = lastDay.getDay();

  // Create calendar days
  var currentDay = 1;
  for (var row = 0; row < 6; row++) {
    var newRow = $("<tr>");
    for (var col = 0; col < 7; col++) {
      var newDay = $("<td>");
      if (
          (row === 0 && col < startIdx) ||
          (row === 5 && col > endIdx)
      ) {
        // Empty cells before and after the month
        newDay.addClass("empty-cell");
      } else if (
          currentDay === currentDate.getDate() &&
          date.getMonth() === currentDate.getMonth() &&
          date.getFullYear() === currentDate.getFullYear()
      ) {
        // Current day
        newDay.text(currentDay).addClass("current-day");
        currentDay++;
      } else if (currentDay <= numDays) {
        // Regular days
        newDay.text(currentDay);
        currentDay++;
      }
      newRow.append(newDay);
    }
    table.append(newRow);
  }

  calendar.append(table);
}
$(document).ready(() => {

  // Render calendar
  renderCalendar(currentDate);

  // Render the calendar for a given month and year

  // Change to previous month
  calendar.on("click", ".prev-month", () => {
    var currentMonth = currentDate.getMonth();
    currentDate.setMonth(currentMonth - 1);
    renderCalendar(currentDate);
  });

  // Change to next month
  calendar.on("click", ".next-month", () => {
    var currentMonth = currentDate.getMonth();
    currentDate.setMonth(currentMonth + 1);
    renderCalendar(currentDate);
  });

  // Highlight the date when mouseover
  calendar.on("mouseover", "td", function () {
    $(this).addClass("highlight");
  });

  calendar.on("mouseout", "td", function () {
    $(this).removeClass("highlight");
  });

  // Handle date click event
  calendar.on("click", "td", function () {
    var day = parseInt($(this).text());
    if (isNaN(day)){
      return
    }
    var month = currentDate.getMonth()+1;
    var year = currentDate.getFullYear();
    var formattedDate = year + "-" + month + "-" + day;
    console.log("Selected date:", formattedDate);

    currentDate = new Date(year,month-1,day)
    renderCalendar(currentDate)
    $("#date-name").val(formattedDate);
    load(formattedDate).then((jsonStr)=>{
      let json = JSON.parse(jsonStr)
      // Switch to today's info
      $("#date-nickname").val(json.name);
      $("#daily-quote").val(json.words);
      deserializeTaskList(json.tasks);
    })
  });

  // Save button click event
  $("#save-btn").click(() => {
    const date = $('#date-name').val()
    const name = $('#date-nickname').val()
    const words = $('#daily-quote').val()
    var tasks = [];
    $("#task-list li").each(function () {
      var checkbox = $(this).find('input[type="checkbox"]');
      var span = $(this).find("span");
      tasks.push({
        checked: checkbox.prop("checked"),
        task: span.text(),
      });
    });

    save(date,JSON.stringify({date:date,name:name,words:words,tasks:tasks}))
  });


});


// Function to handle task deletion
function handleTaskDelete() {
  $(this).closest("li").remove();
  if ($("#task-list").text() === ""){
    $("#task-list").text("无")
  }
}
$(document).ready(function() {
  // Function to handle checkbox change event
  function handleCheckboxChange() {
    var isChecked = $(this).is(":checked");
    var listItem = $(this).closest("li");

    if (isChecked) {
      listItem.addClass("checked");
    } else {
      listItem.removeClass("checked");
    }
  }

  // Function to handle task editing
  function handleTaskEdit() {
    var listItem = $(this).closest("li");
    var taskText = listItem.find(".task-text");
    var taskInput = $('<input type="text" class="task-input">').val(taskText.text());

    taskText.hide();
    taskText.after(taskInput);

    taskInput.focus();

    taskInput.on("blur", function() {
      var newTaskText = taskInput.val().trim();
      taskInput.remove();
      taskText.show();

      if (newTaskText !== "") {
        taskText.text(newTaskText);
      }
    });

    taskInput.on("keypress", function(event) {
      if (event.which === 13) {
        taskInput.blur();
      }
    });
  }

  // Function to add new task to the list
  function addNewTask() {
    var newTaskText = $("#new-task-input").val();

    if (newTaskText !== "") {
      var listItem = $("<li>");
      var checkbox = $("<input type='checkbox'>");
      var taskText = $("<span class='task-text'>").text(newTaskText);
      var deleteBtn = $("<botton class='delete-btn'>").text("×");

      listItem.append(checkbox, taskText, deleteBtn);

      // Attach task delete event handler
      deleteBtn.on("click", handleTaskDelete);

      if ( JSON.stringify($("#task-list").text()).includes("无")){
        $("#task-list").text("")
      }
      $("#task-list").append(listItem);
      $("#new-task-input").val("");

      // Trigger task editing immediately
      listItem.trigger("dblclick");
    }
  }

  // Attach checkbox change event handler
  $("#task-list").on("change", "input[type='checkbox']", handleCheckboxChange);

  // Attach task edit event handler
  $("#task-list").on("dblclick", "li", handleTaskEdit);

  // Attach click event handler for adding new task
  $("#add-task-btn").on("click", addNewTask);
});



const { invoke } = window.__TAURI__.tauri;


async function save(date,json) {
  await invoke("save", { date:date,json: json });
}
async function load(date) {
  return  await invoke("load", { date:date});
}

// 反序列化JSON数据为任务清单列表
function deserializeTaskList(taskList) {
  // 清空任务清单
  $("#task-list").empty();

  // 遍历任务列表并添加到任务清单
  for (var i = 0; i < taskList.length; i++) {
    var listItem = $("<li>");
    var checkbox = $("<input type='checkbox'>").prop("checked",taskList[i].checked);
    var taskText = $("<span class='task-text'>").text(taskList[i].task);
    var deleteBtn = $("<botton class='delete-btn'>").text("×");

    listItem.append(checkbox, taskText, deleteBtn);

    // Attach task delete event handler
    deleteBtn.on("click", handleTaskDelete);

    if ( JSON.stringify($("#task-list").text()).includes("无")){
      $("#task-list").text("")
    }

    // Trigger task editing immediately
    listItem.trigger("dblclick");

    $("#task-list").append(listItem);
  }
}
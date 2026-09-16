// Redirect to the proper page when clicked on after a split second

// Query the Dashboard buttons

// MANAGER //

//GET HOURS
const manager_hours = document.querySelector("#get_hours");

console.log(manager_hours);

//GET SCHEDULE
const manager_schedule = document.querySelector("#weeks_schedule");

//GET MESSAGES
const employee_calendar = document.querySelector("#employee_calendar");

// SEE WEEK SCHEDULE
const weekly_calendar = document.querySelector("#view_week_schedule");

// Now we will add the event listeners to the buttons
// MANAGER //

// Get Employee Hours
manager_hours.addEventListener("click", function (e) {
  e.preventDefault(); // Prevent the default action of the button
  manager_hours.classList.add("clicked");
  setTimeout(() => {
    manager_hours.classList.remove("clicked");
  }, 1000);
  setTimeout(() => {
    window.location.href = "../../manager_scheduler.html";
    window.location.href = "../../html/calendar/manager_scheduler.html";
  }, 1000);
});

// Get Weekly Schedule
manager_schedule.addEventListener("click", function (e) {
  e.preventDefault(); // Prevent the default action of the button
  manager_schedule.classList.add("clicked");
  setTimeout(() => {
    manager_schedule.classList.remove("clicked");
  }, 1000);
  setTimeout(() => {
    window.location.href = "../../html/calendar/manager_weekly.html";
  }, 1000);
});

// Get Monthly Schedule
employee_calendar.addEventListener("click", function (e) {
  e.preventDefault(); // Prevent the default action of the button
  employee_calendar.classList.add("clicked");
  setTimeout(() => {
    employee_calendar.classList.remove("clicked");
  }, 1000);
  setTimeout(() => {
    window.location.href = "../../html/manager/manager_calendar.html";
  }, 1000);
});

// Look at Weekly Calendar
weekly_calendar.addEventListener("click", function (e) {
  e.preventDefault(); // Prevent the default action of the button
  weekly_calendar.classList.add("clicked");
  setTimeout(() => {
    weekly_calendar.classList.remove("clicked");
  }, 1000);
  setTimeout(() => {
    window.location.href = "../../html/calendar/week_schedule.html";
  }, 1000);
});

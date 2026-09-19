// Test Print
console.log("manager_calendar.js loaded");

// Get current month and year
const currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Initialize month names array
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Function to RENDER THE CALENDAR for a specific month and year
function renderCalendar(month, year) {
  // Get the table body
  const calendarBody = document.getElementById("calendar-body");
  if (!calendarBody) {
    console.error("Calendar table body not found");
    return;
  }

  calendarBody.innerHTML = "";

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDay = new Date(year, month, 1).getDay();

  // Get number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create calendar rows and cells
  let date = 1;

  // Always create exactly 6 rows for the calendar (standard calendar view)
  for (let i = 0; i < 6; i++) {
    // Create table row
    const row = document.createElement("tr");

    // Create cells for each day of the week
    for (let j = 0; j < 7; j++) {
      // Each day cell is created here
      const cell = document.createElement("td");

      /////////////// FOR HOURS MODAL /////////////////
      ////////////////////////////////////////////////
      ////////////////////////////////////////////////
      // Add class to be queryable in javascript
      // here you will query all the cells and when each is clicked
      // the modal will open.  There you will enter date and hours worked
      // and then save it to the database
      cell.classList.add("calendar-cell");

      // The JS will query all the cells and when each is clicked
      // the modal will open.  There you will enter date and hours worked
      let eachDay = document.querySelectorAll(".calendar-cell");

      // Add data attribute to each cell for the date
      cell.setAttribute("data-date", `${date}`);
      // Add data attribute to each cell for the month
      cell.setAttribute("data-month", `${month}`);
      // Add data attribute to each cell for the year
      cell.setAttribute("data-year", `${year}`);
      // Add data attribute to each cell for the day of the week
      cell.setAttribute("data-day", `${j}`);

      //////////////////////////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////////////////////////
      // Query the modal to open and close it
      const modal = document.getElementById("cal_modal");
      // CLOSE MODAL BUTTON
      const closeModal = document.getElementById("close_modal");
      // These event listeners are to be relocated outside of the eachDay.forEach function to prevent multiple event listeners being added each time a cell is clicked.  This will cause the modal to close immediately after opening it.
      window.addEventListener("click", function (event) {
        if (event.target === modal) {
          modal.classList.remove("modal_active"); // Hide the modal
          console.log(`${modal.classList} normal class of the modal`);
        }
      });
      // Add event listener to close the modal when clicking the close button
      closeModal.addEventListener("click", function () {
        modal.classList.remove("modal_active"); // Hide the modal
        console.log(`${modal.classList} normal class of the modal`);
      });
      // Add event listener to close the modal when pressing the escape key
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          // closeModal();
          modal.classList.remove("modal_active"); // Hide the modal
          console.log(`${modal.classList} normal class of the modal`);
        }
      });

      /////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////////
      // Add event listener to each cell
      // MODAL FOR EACH DAY TO POPUP
      // This will open a modal or perform an action when a cell is clicked
      eachDay.forEach(function (cell) {
        // Add click event listener to each cell
        cell.addEventListener("click", function (e) {
          e.stopPropagation(); // Prevent event bubbling
          e.preventDefault(); // Prevent default action if used in onclick
          ////////////////////////////////////////////////////////////////
          ////////////////////////////////////////////////////////////////

          // Populate the PAGE HEADER with the Logged User name
          const pageHeader = document.getElementById("employee_name_month");
          console.log(`This is the Page Header: ${pageHeader.innerText}`);
          // Parse the user name
          // const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser') || sessionStorage.getItem('session'));
          const userString =
            sessionStorage.getItem("currentUser") ||
            sessionStorage.getItem("session") ||
            null;
          //Error handling for null userString
          const loggedUser = userString ? JSON.parse(userString) : null;
          // Get the user name from the logged user object
          console.log(`The Logged User: ${loggedUser.username}`);
          // Decode the user name from the logged user object
          const decodedUser = decodeURIComponent(loggedUser.username);
          pageHeader.innerHTML = `${decodedUser}`; // Populate the header with the logged user name

          //////////////////////////////////////////////////////
          // Populate the modal with the clicked date
          const cellDate = cell.textContent;
          const cellMonth = month + 1; // Add 1 to month since it's 0-indexed
          const cellYear = year;

          // Create date format used by employee hours data
          const formattedMonth = monthNames[cellMonth - 1];
          const formattedDate = String(cellDate).padStart(2, "0");

          const clickedDate = `${formattedMonth} ${formattedDate}, ${cellYear}`;

          console.log(`Clicked Date: ${clickedDate}`);

          // EMPLOYEES WORKED HOURS IN THE MODAL
          const users = JSON.parse(localStorage.getItem("users")) || [];

          const employeesWorked = users
            .filter((user) => user.accountType !== "Manager")
            .map((user) => {
              const hoursWorked = user.hours?.find(
                (hour) => hour.date === clickedDate,
              );

              return {
                username: decodeURIComponent(user.username),
                hours: hoursWorked,
              };
            })
            .filter((employee) => employee.hours);

          console.log("Employees Worked:", employeesWorked);

          // DATE ESTABLISHED IN THE MODAL
          // Set The DatePicker to the clicked date
          const now = new Date(); // This goes in the top date picker
          // make now the date in the cell clicked
          now.setDate(cellDate); // Set the date to the cell clicked
          // Query the DatePicker element
          const datePicker = document.getElementById("current_day");
          // Set the value of the DatePicker to the current date in YYYY-MM-DD format
          datePicker.value = now.toISOString().split("T")[0]; // YYYY-MM-DD
          // Set the value of the DatePicker to month name
          datePicker.value = now.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "2-digit",
          });

          renderEmployeesWorked(employeesWorked);

          // Open modal or perform action here
          console.log(`Clicked on ${cell.textContent}`);
          // Open the modal (you can use a library or custom code to show the modal)
          modal.classList.add("modal_active"); // Show the modal
          // pageHeader.classList.add('modal_active'); // Fade out the top of page
          // Test Print
          console.log(`${modal.classList}the new class of the modal`);
          // console.log(`${pageHeader.classList} the new class of the page header`);
          // Add event listener to close the modal when clicking outside of it
        });
      });

      ///////////////////////////////////////////////////////
      ///////CELL CONTENT (THE DATE)
      const cellContent = document.createElement("span");

      // give it a general class to style change
      cellContent.classList.add("the_date_number");

      // Add dates starting from the correct day of the week
      if (i === 0 && j < firstDay) {
        // Empty cells before the first day of month
        cell.classList.add("empty");
      } else if (date > daysInMonth) {
        // Empty cells after the last day of month
        cell.classList.add("empty");
      } else {
        // Regular day cells
        cellContent.textContent = date;

        // Check if it's today
        if (
          date === currentDate.getDate() &&
          month === currentDate.getMonth() &&
          year === currentDate.getFullYear()
        ) {
          cell.classList.add("today");
        }

        // Add click handler
        cell.addEventListener("click", function () {
          // Remove any previously selected cell
          const selectedCells = document.querySelectorAll(".selected");
          selectedCells.forEach((cell) => cell.classList.remove("selected"));

          // Mark this cell as selected
          this.classList.add("selected");
        });

        date++;
      }
      // The Date appended to the cell appended to the calendar
      cell.appendChild(cellContent);
      row.appendChild(cell);
    }
    calendarBody.appendChild(row);
  }
}

// RENDER EMPLOYEES WORKED FUNCTION
function renderEmployeesWorked(employees) {
  const container = document.getElementById("employees_worked");

  // Clear results from previously clicked date
  container.innerHTML = "";

  // No employees worked this date
  if (employees.length === 0) {
    container.textContent = "No employee hours recorded for this date.";
    return;
  }

  // Render every employee who worked this date
  employees.forEach((employee) => {
    const employeeRow = document.createElement("div");
    employeeRow.className = "employee-worked-row";

    const employeeName = document.createElement("span");
    employeeName.className = "employee-worked-name";
    employeeName.textContent = employee.username;

    const employeeHours = document.createElement("span");
    employeeHours.className = "employee-worked-hours";
    employeeHours.textContent = `${employee.hours.inTime} - ${employee.hours.outTime}`;

    employeeRow.appendChild(employeeName);
    employeeRow.appendChild(employeeHours);

    container.appendChild(employeeRow);
  });
}

// CANCEL BUTTON

// STYLE THE CELLS FUNCTION

// Function to update calendar header
function updateCalendarHeader(month, year) {
  document.getElementById("current-month").textContent =
    `${monthNames[month]} ${year}`;
}

// Modified DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function () {
  renderCalendar(currentMonth, currentYear);
  updateCalendarHeader(currentMonth, currentYear);

  // Style cells with time entries AFTER the calendar is rendered
  //   styleCellsWithTimeEntries();
});

// Also call styleCellsWithTimeEntries after month navigation
function prevMonth() {
  currentMonth = currentMonth <= 0 ? 11 : currentMonth - 1;
  currentYear = currentMonth === 11 ? currentYear - 1 : currentYear;
  renderCalendar(currentMonth, currentYear);
  updateCalendarHeader(currentMonth, currentYear);

  // Re-style cells after rendering new month
  //   styleCellsWithTimeEntries();

  return false;
}

function nextMonth() {
  currentMonth = currentMonth >= 11 ? 0 : currentMonth + 1;
  currentYear = currentMonth === 0 ? currentYear + 1 : currentYear;
  renderCalendar(currentMonth, currentYear);
  updateCalendarHeader(currentMonth, currentYear);

  // Re-style cells after rendering new month
  //   styleCellsWithTimeEntries();

  return false;
}

///////////////////////////////////////////////////////////////////
///////////////////BACK TO DASHBOARD LINK///////////////////////////////
// Query the back to dashboard link and add an event listener to it
const backToDashboardLink = document.getElementById("link_back");

if (backToDashboardLink) {
  backToDashboardLink.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the default link behavior

    // Retrieving the User Role
    const userType =
      sessionStorage.getItem("currentUser") ||
      sessionStorage.getItem("session") ||
      null;
    const userTypeAcc = userType ? JSON.parse(userType) : null;
    const userRole = userTypeAcc.accountType;

    if (userRole === "Manager") {
      // Redirect to manager dashboard
      window.location.href = "../../html/dashboards/manager.html"; // Replace with the actual URL for the manager dashboard
    } else {
      // Default redirect to the main dashboard
      window.location.href = "../../html/dashboards/employee.html"; // Replace with the actual URL for the main dashboard
    }
  });
}

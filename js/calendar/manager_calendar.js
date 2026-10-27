(() => {
  const API = "http://localhost:3000";
  const TIME_ZONE = "America/Detroit";

  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  let requestNumber = 0;

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

  const calendarBody = document.getElementById("calendar-body");
  const monthHeader = document.getElementById("current-month");
  const modal = document.getElementById("cal_modal");
  const closeButton = document.getElementById("close_modal");
  const dateDisplay = document.getElementById("current_day");
  const employeesContainer = document.getElementById("employees_worked");

  async function getJson(path) {
    const response = await fetch(`${API}${path}`, {
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.replace("../../index.html");
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to load employee hours.");
    }

    return data;
  }

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function renderEmployeesWorked(entries) {
    employeesContainer.replaceChildren();

    if (entries.length === 0) {
      employeesContainer.textContent =
        "No employee hours recorded for this date.";
      return;
    }

    entries.forEach((entry) => {
      const row = document.createElement("div");
      row.className = "employee-worked-row";

      const name = document.createElement("span");
      name.className = "employee-worked-name";
      name.textContent = `${entry.first_name} ${entry.last_name}`.trim();

      const hours = document.createElement("span");
      hours.className = "employee-worked-hours";
      hours.textContent = `${formatTime(entry.clock_in)} - ${formatTime(entry.clock_out)}`;

      row.append(name, hours);
      employeesContainer.appendChild(row);
    });
  }

  async function showDate(year, month, day) {
    const date = [
      year,
      String(month + 1).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-");

    dateDisplay.value = `${monthNames[month]} ${day}, ${year}`;
    employeesContainer.textContent = "Loading employee hours…";
    modal.classList.add("modal_active");

    // Ignore an older response if the user has since selected another date.
    const thisRequest = ++requestNumber;

    try {
      const entries = await getJson(
        `/manager/time-entries?date=${encodeURIComponent(date)}`,
      );

      if (!entries || thisRequest !== requestNumber) return;

      renderEmployeesWorked(entries);
    } catch (error) {
      if (thisRequest !== requestNumber) return;

      console.error("Failed to load calendar hours:", error);
      employeesContainer.textContent = error.message;
    }
  }

  function renderCalendar() {
    calendarBody.replaceChildren();
    monthHeader.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    let day = 1;

    for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
      const row = document.createElement("tr");

      for (let column = 0; column < 7; column++) {
        const cell = document.createElement("td");
        cell.classList.add("calendar-cell");

        if ((rowIndex === 0 && column < firstDay) || day > daysInMonth) {
          cell.classList.add("empty");
        } else {
          const selectedDay = day;
          const selectedMonth = currentMonth;
          const selectedYear = currentYear;

          const dayLabel = document.createElement("span");
          dayLabel.className = "the_date_number";
          dayLabel.textContent = selectedDay;
          cell.appendChild(dayLabel);

          if (
            selectedDay === today.getDate() &&
            selectedMonth === today.getMonth() &&
            selectedYear === today.getFullYear()
          ) {
            cell.classList.add("today");
          }

          cell.addEventListener("click", () => {
            document
              .querySelectorAll("#calendar-body .selected")
              .forEach((selected) => selected.classList.remove("selected"));

            cell.classList.add("selected");
            showDate(selectedYear, selectedMonth, selectedDay);
          });

          day++;
        }

        row.appendChild(cell);
      }

      calendarBody.appendChild(row);
    }
  }

  // The month buttons call these functions from the existing HTML.
  window.prevMonth = function () {
    currentMonth--;

    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }

    renderCalendar();
    return false;
  };

  window.nextMonth = function () {
    currentMonth++;

    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }

    renderCalendar();
    return false;
  };

  function closeModal() {
    requestNumber++;
    modal.classList.remove("modal_active");
  }

  closeButton.addEventListener("click", closeModal);

  window.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  document.getElementById("link_back").addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "../../html/dashboards/manager.html";
  });

  async function initialize() {
    try {
      const session = await getJson("/session");
      if (!session) return;

      if (session.user.role !== "manager") {
        window.location.replace("../../html/dashboards/employee.html");
        return;
      }

      const managerName =
        `${session.user.firstName} ${session.user.lastName}`.trim();

      for (const id of [
        "employee_name",
        "employee_name_month",
        "profile_calendar_name",
      ]) {
        const element = document.getElementById(id);
        if (element) element.textContent = managerName;
      }

      const account = document.getElementById("profile_calendar_account");
      if (account) account.textContent = "Manager";

      renderCalendar();
    } catch (error) {
      console.error("Failed to initialize manager calendar:", error);
      monthHeader.textContent = error.message;
    }
  }

  initialize();
})();

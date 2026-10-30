// Test Print
console.log("Weekly Calendar JS Loaded");

// Get current date and set up week tracking
const currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Track the current week - start with current week
let currentWeekStart = getWeekStart(currentDate);

console.log(currentMonth + 1);
console.log(currentYear);
console.log(currentDate);

// Month names array
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Day names array
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Function to get the start of the week (Sunday) for any given date
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

// Function to get the end of the week (Saturday) for any given date
function getWeekEnd(weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}

// Function to format date range for display
function formatWeekRange(weekStart) {
  const weekEnd = getWeekEnd(weekStart);

  // If week spans multiple months
  if (weekStart.getMonth() !== weekEnd.getMonth()) {
    return `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${monthNames[weekEnd.getMonth()]} ${weekEnd.getDate()}`;
  }
  // If week is within same month
  else {
    return `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${weekEnd.getDate()}`;
  }
}

// Move the submit listener flag outside to module level
let submitListenerAdded = false;

function setupSubmitButtonListener() {
  if (submitListenerAdded) return;

  const button = document.getElementById("submit_employee_hours_modal");
  if (!button) return;

  let saving = false;

  const slots = [
    ["driver_one_am", "driver-one-am", "zam-in-one", "zam-out-one"],
    ["driver_two_am", "driver-two-am", "zam-in-two", "zam-out-two"],
    ["driver_one_pm", "driver-one-pm", "zam-in-three", "zam-out-three"],
    ["driver_two_pm", "driver-two-pm", "zam-in-four", "zam-out-four"],
    [
      "skate_guard_one",
      "skate-guard-one",
      "skate-guard-in-one",
      "skate-guard-out-one",
    ],
    [
      "skate_guard_two",
      "skate-guard-two",
      "skate-guard-in-two",
      "skate-guard-out-two",
    ],
  ];

  function to24Hour(value) {
    const match = value.match(/^(\d{1,2}):([0-5]\d) (AM|PM)$/);

    if (!match || Number(match[1]) < 1 || Number(match[1]) > 12) {
      throw new Error("Select a valid time.");
    }

    let hour = Number(match[1]) % 12;
    if (match[3] === "PM") hour += 12;

    return `${String(hour).padStart(2, "0")}:${match[2]}`;
  }

  button.addEventListener("click", async (event) => {
    event.preventDefault();
    if (saving) return;

    const originalLabel = button.textContent;

    try {
      const date = document.getElementById("day_selected").dataset.selectedDate;

      if (!date) {
        throw new Error("Select a schedule date first.");
      }

      const shifts = [];

      for (const [slot, employeeId, startId, endId] of slots) {
        const employee = document.getElementById(employeeId).value;
        const start = document.getElementById(startId).value;
        const end = document.getElementById(endId).value;

        // Completely blank slots are left unassigned.
        if (!employee && !start && !end) continue;

        if (!employee || !start || !end) {
          throw new Error(
            "Each selected assignment needs an employee, In time, and Out time.",
          );
        }

        if (start === "close") {
          throw new Error("Close can only be selected as an Out time.");
        }

        const userId = Number(employee);

        if (!Number.isSafeInteger(userId) || userId <= 0) {
          throw new Error("Select a valid employee.");
        }

        const startTime = to24Hour(start);
        const endsAtClose = end === "close";
        const endTime = endsAtClose ? null : to24Hour(end);

        if (endTime === startTime) {
          throw new Error("In and Out times must be different.");
        }

        shifts.push({
          slot,
          userId,
          startTime,
          endTime,
          endsAtClose,
        });
      }

      if (shifts.length === 0) {
        throw new Error("Add at least one complete assignment.");
      }

      saving = true;
      button.disabled = true;
      button.textContent = "Saving…";

      const response = await fetch(
        `http://localhost:3000/manager/schedules/${encodeURIComponent(date)}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ shifts }),
        },
      );

      if (response.status === 401) {
        window.location.replace("../../index.html");
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save schedule.");
      }

      document.getElementById("cal_modal").classList.remove("modal_active");
      document.body.classList.remove("no-scroll");

      resetFormFields();
      renderWeeklyCalendar(currentWeekStart);
      updateWeekHeader(currentWeekStart);

      alert(`Schedule saved for ${date}.`);
    } catch (error) {
      console.error("Failed to save schedule:", error);
      alert(error.message);
    } finally {
      saving = false;
      button.textContent = originalLabel;
      button.disabled = true;
    }
  });

  submitListenerAdded = true;
}

// Function to reset form fields
function resetFormFields() {
  const selects = [
    "driver-one-am",
    "driver-two-am",
    "driver-one-pm",
    "driver-two-pm",
    "skate-guard-one",
    "skate-guard-two",
  ];

  selects.forEach((id) => {
    const select = document.getElementById(id);
    if (select) select.value = "";
  });

  // Reset time pickers
  const timePickers = document.querySelectorAll(".time_picker_sched");
  timePickers.forEach((picker) => {
    picker.selectedIndex = 0;
  });

  // Reset selected button
  const selectedButton = document.querySelector(".selected");
  if (selectedButton) {
    selectedButton.classList.remove("selected");
  }

  // Clear date field
  const emp_hours_current_date = document.getElementById("day_selected");
  if (emp_hours_current_date) {
    emp_hours_current_date.innerHTML = "";
    emp_hours_current_date.removeAttribute("data-selected-date");
  }
}

// Function to render the weekly calendar as buttons in a column
function renderWeeklyCalendar(weekStart) {
  const calendarBody = document.getElementById("calendar-body");
  if (!calendarBody) {
    console.error("Calendar container not found");
    return;
  }

  calendarBody.innerHTML = "";

  // Generate 7 days starting from weekStart
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + i);

    // Create button element for each day
    const dayButton = document.createElement("button");
    dayButton.classList.add("calendar-cell", "week-day-button");

    // Add data attributes for the date
    dayButton.setAttribute("data-date", dayDate.getDate());
    dayButton.setAttribute("data-month", dayDate.getMonth());
    dayButton.setAttribute("data-year", dayDate.getFullYear());
    dayButton.setAttribute("data-day", i);

    // Create button content
    const buttonContent = document.createElement("div");
    buttonContent.classList.add("day-button-content");

    // Add day name
    const dayName = document.createElement("span");
    dayName.classList.add("day-name");
    dayName.textContent = `${dayNames[i]}\u00A0\u00A0|\u00A0\u00A0`;

    // Add full date
    const fullDate = document.createElement("span");
    fullDate.classList.add("full-date");
    fullDate.textContent = `${monthNames[dayDate.getMonth()]} ${dayDate.getDate()}`;

    // Check if it's today
    const today = new Date();
    if (dayDate.toDateString() === today.toDateString()) {
      dayButton.classList.add("today");
    }

    // Check if it's in a different month
    if (dayDate.getMonth() !== currentMonth) {
      dayButton.classList.add("other-month");
    }

    // Add click event listener to each day button
    dayButton.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();

      // Toggle body scroll
      document.body.classList.toggle("no-scroll");

      // Remove previous selection
      const selectedButtons = document.querySelectorAll(".selected");
      selectedButtons.forEach((btn) => btn.classList.remove("selected"));

      // Mark this button as selected
      this.classList.add("selected");

      console.log(`Clicked on day: ${dayDate.toDateString()}`);

      // Open modal
      openScheduleModal(dayDate);
    });

    // Assemble button content
    buttonContent.appendChild(dayName);
    buttonContent.appendChild(fullDate);
    dayButton.appendChild(buttonContent);

    // Add button to calendar container
    calendarBody.appendChild(dayButton);
  }
}

let scheduleModalRequest = 0;

// PostGre SQL Retrieval for Modal
async function openScheduleModal(dayDate) {
  const modal = document.getElementById("cal_modal");
  const dateElement = document.getElementById("day_selected");
  const submitButton = document.getElementById("submit_employee_hours_modal");

  if (!modal || !dateElement || !submitButton) return;

  const thisRequest = ++scheduleModalRequest;

  const date = [
    dayDate.getFullYear(),
    String(dayDate.getMonth() + 1).padStart(2, "0"),
    String(dayDate.getDate()).padStart(2, "0"),
  ].join("-");

  const fields = {
    driver_one_am: ["driver-one-am", "zam-in-one", "zam-out-one"],
    driver_two_am: ["driver-two-am", "zam-in-two", "zam-out-two"],
    driver_one_pm: ["driver-one-pm", "zam-in-three", "zam-out-three"],
    driver_two_pm: ["driver-two-pm", "zam-in-four", "zam-out-four"],
    skate_guard_one: [
      "skate-guard-one",
      "skate-guard-in-one",
      "skate-guard-out-one",
    ],
    skate_guard_two: [
      "skate-guard-two",
      "skate-guard-in-two",
      "skate-guard-out-two",
    ],
  };

  const fieldIds = Object.values(fields).flat();

  function setFieldsDisabled(disabled) {
    fieldIds.forEach((id) => {
      document.getElementById(id).disabled = disabled;
    });
  }

  function pickerTime(value) {
    const [hour, minute] = value.split(":");
    const hourNumber = Number(hour);

    return (
      `${hourNumber % 12 || 12}:${minute} ` +
      `${hourNumber >= 12 ? "PM" : "AM"}`
    );
  }

  function selectValue(id, value) {
    const select = document.getElementById(id);

    if (![...select.options].some((option) => option.value === value)) {
      throw new Error(
        "A saved employee or time is unavailable in the scheduling form.",
      );
    }

    select.value = value;
  }

  dateElement.textContent = dayDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  dateElement.dataset.selectedDate = date;

  modal.classList.add("modal_active");
  document.body.classList.add("no-scroll");

  const managerName = document.getElementById("employee_name");
  const modalName = document.getElementById("employee_name_month");

  if (managerName && modalName) {
    modalName.textContent = managerName.textContent;
  }

  setupCloseButton();

  submitButton.disabled = true;
  submitButton.textContent = "Loading…";

  try {
    // Populate employee and time options before selecting saved values.
    await populateDropdowns();

    if (thisRequest !== scheduleModalRequest) return;

    setFieldsDisabled(true);

    const response = await fetch(
      `http://localhost:3000/manager/schedules/${date}`,
      { credentials: "include" },
    );

    if (response.status === 401) {
      window.location.replace("../../index.html");
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to load this schedule.");
    }

    if (
      thisRequest !== scheduleModalRequest ||
      !modal.classList.contains("modal_active")
    ) {
      return;
    }

    for (const shift of data.shifts) {
      const ids = fields[shift.slot];
      if (!ids) throw new Error("The schedule contains an unknown slot.");

      selectValue(ids[0], String(shift.user_id));
      selectValue(ids[1], pickerTime(shift.start_time));
      selectValue(
        ids[2],
        shift.ends_at_close ? "close" : pickerTime(shift.end_time),
      );
    }

    setFieldsDisabled(false);

    // Refresh submit validation after restoring the saved selections.
    setupFormValidation();

    document
      .getElementById("driver-one-am")
      .dispatchEvent(new Event("change", { bubbles: true }));
  } catch (error) {
    if (thisRequest !== scheduleModalRequest) return;

    console.error("Failed to reopen schedule:", error);

    setFieldsDisabled(true);
    submitButton.disabled = true;
    alert(error.message);
  } finally {
    if (thisRequest === scheduleModalRequest) {
      submitButton.textContent = "Submit Hours";
    }
  }
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

async function populateDropdowns() {
  const driverDropdowns = [
    "driver-one-am",
    "driver-two-am",
    "driver-one-pm",
    "driver-two-pm",
  ];

  const guardDropdowns = ["skate-guard-one", "skate-guard-two"];

  const dropdownIds = [...driverDropdowns, ...guardDropdowns];
  const submitButton = document.getElementById("submit_employee_hours_modal");

  if (submitButton) submitButton.disabled = true;

  dropdownIds.forEach((id) => {
    const dropdown = document.getElementById(id);

    if (dropdown) {
      clearAndAddBlankOption(dropdown);
      dropdown.disabled = true;
    }
  });

  populateTimePickers();

  try {
    const response = await fetch("http://localhost:3000/manager/employees", {
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.replace("../../index.html");
      return;
    }

    const employees = await response.json();

    if (!response.ok) {
      throw new Error(employees.error || "Unable to load employees.");
    }

    function fillDropdowns(ids, jobTitle) {
      ids.forEach((id) => {
        const dropdown = document.getElementById(id);
        if (!dropdown) return;

        employees
          .filter((employee) => employee.job_title === jobTitle)
          .forEach((employee) => {
            const option = document.createElement("option");

            option.value = String(employee.id);
            option.textContent =
              `${employee.first_name} ${employee.last_name}`.trim();
            option.className = "driver-option";

            dropdown.appendChild(option);
          });

        dropdown.disabled = false;
      });
    }

    fillDropdowns(driverDropdowns, "zamboni_driver");
    fillDropdowns(guardDropdowns, "skate_guard");
  } catch (error) {
    console.error("Failed to load scheduling employees:", error);
    alert(error.message);
  }
}

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

// Helper function to clear dropdown and add blank option
function clearAndAddBlankOption(dropdown) {
  dropdown.innerHTML = "";
  const blankOption = document.createElement("option");
  blankOption.value = "";
  blankOption.selected = true;
  blankOption.style.backgroundColor = "var(--input-background)";
  dropdown.appendChild(blankOption);
}

// Function to populate time pickers
function populateTimePickers() {
  const timePickers = [
    "zam-in-one",
    "zam-out-one",
    "zam-in-two",
    "zam-out-two",
    "zam-in-three",
    "zam-out-three",
    "zam-in-four",
    "zam-out-four",
    "skate-guard-in-one",
    "skate-guard-out-one",
    "skate-guard-in-two",
    "skate-guard-out-two",
  ];
  timePickers.forEach((id) => {
    const select = document.getElementById(id);
    if (select) {
      select.innerHTML = "";

      // Add blank option
      const blankOption = document.createElement("option");
      blankOption.value = "";
      blankOption.textContent = select.id.includes("in") ? "In" : "Out";
      blankOption.selected = true;
      select.appendChild(blankOption);

      // Generate time options (5:00 AM to 11:30 PM)
      for (let hour = 5; hour <= 23; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          addTimeOption(select, hour, minute);
        }
      }

      // Add "Close" option after 10:00 PM
      const closeOption = document.createElement("option");
      closeOption.value = "close";
      closeOption.textContent = "Close";
      select.appendChild(closeOption);
    }
  });
}

// Function to add time options to a select element
function addTimeOption(select, hour, minute) {
  let displayHour = hour;
  let ampm = "AM";

  if (hour === 0) {
    displayHour = 12;
  } else if (hour === 12) {
    ampm = "PM";
  } else if (hour > 12) {
    displayHour = hour - 12;
    ampm = "PM";
  }

  const formattedMinute = minute.toString().padStart(2, "0");
  const timeString = `${displayHour}:${formattedMinute} ${ampm}`;

  const option = document.createElement("option");
  option.value = timeString;
  option.textContent = timeString;
  option.classList.add("time-option");
  select.appendChild(option);
}

// Function to setup close button
function setupCloseButton() {
  const closeSchedulerModal = document.getElementById("close_modal");
  if (closeSchedulerModal) {
    // Remove any existing listeners
    closeSchedulerModal.replaceWith(closeSchedulerModal.cloneNode(true));
    const newCloseButton = document.getElementById("close_modal");

    newCloseButton.addEventListener("click", function (e) {
      e.preventDefault();
      const make_employee_schedule = document.getElementById("cal_modal");
      make_employee_schedule.classList.remove("modal_active");

      if (document.body.classList.contains("no-scroll")) {
        document.body.classList.remove("no-scroll");
      }
    });
  }
}

// Function to setup form validation
// Function to setup form validation
function setupFormValidation() {
  const submitButton = document.getElementById("submit_employee_hours_modal");
  if (!submitButton) return;

  function checkEnableSubmit() {
    let hasValidEntry = false;

    // Check zamboni drivers (each needs name + in time + out time)
    const drivers = [
      { name: "driver-one-am", in: "zam-in-one", out: "zam-out-one" },
      { name: "driver-two-am", in: "zam-in-two", out: "zam-out-two" },
      { name: "driver-one-pm", in: "zam-in-three", out: "zam-out-three" },
      { name: "driver-two-pm", in: "zam-in-four", out: "zam-out-four" },
    ];

    // Check if any driver has complete entry (name + in + out)
    drivers.forEach((driver) => {
      const nameSelect = document.getElementById(driver.name);
      const inSelect = document.getElementById(driver.in);
      const outSelect = document.getElementById(driver.out);

      if (nameSelect && inSelect && outSelect) {
        const hasName = nameSelect.value && nameSelect.value.trim() !== "";
        const hasInTime = inSelect.value && inSelect.value.trim() !== "";
        const hasOutTime = outSelect.value && outSelect.value.trim() !== "";

        if (hasName && hasInTime && hasOutTime) {
          hasValidEntry = true;
        }
      }
    });

    // Check skate guards (each needs name + in time + out time)
    const skateGuards = [
      {
        name: "skate-guard-one",
        in: "skate-guard-in-one",
        out: "skate-guard-out-one",
      },
      {
        name: "skate-guard-two",
        in: "skate-guard-in-two",
        out: "skate-guard-out-two",
      },
    ];

    // Check if any skate guard has complete entry (name + in + out)
    skateGuards.forEach((guard) => {
      const nameSelect = document.getElementById(guard.name);
      const inSelect = document.getElementById(guard.in);
      const outSelect = document.getElementById(guard.out);

      if (nameSelect && inSelect && outSelect) {
        const hasName = nameSelect.value && nameSelect.value.trim() !== "";
        const hasInTime = inSelect.value && inSelect.value.trim() !== "";
        const hasOutTime = outSelect.value && outSelect.value.trim() !== "";

        if (hasName && hasInTime && hasOutTime) {
          hasValidEntry = true;
        }
      }
    });

    // Enable submit button if at least one complete entry exists
    submitButton.disabled = !hasValidEntry;
  }

  // Add event listeners to all form elements (names and times)
  const allSelects = document.querySelectorAll(
    ".name_picker_sched, .time_picker_sched",
  );
  allSelects.forEach((select) => {
    select.addEventListener("change", checkEnableSubmit);
  });

  // Initially disable submit button
  submitButton.disabled = true;
}

// Function to setup form validation
// function setupFormValidation() {
//   const submitButton = document.getElementById('submit_employee_hours_modal');
//   if (!submitButton) return;

//   function checkEnableSubmit() {
//     let hasValidEntry = false;

//     // Check zamboni drivers (each needs name + in time + out time)
//     const drivers = [
//       { name: 'driver-one-am', in: 'zam-in-one', out: 'zam-out-one' },
//       { name: 'driver-two-am', in: 'zam-in-two', out: 'zam-out-two' },
//       { name: 'driver-one-pm', in: 'zam-in-three', out: 'zam-out-three' },
//       { name: 'driver-two-pm', in: 'zam-in-four', out: 'zam-out-four' }
//     ];

//     // Check if any driver has complete entry
//     drivers.forEach(driver => {
//       const nameSelect = document.getElementById(driver.name);
//       const inSelect = document.getElementById(driver.in);
//       const outSelect = document.getElementById(driver.out);

//       if (nameSelect && inSelect && outSelect) {
//         const hasName = nameSelect.value && nameSelect.value.trim() !== '';
//         const hasInTime = inSelect.value && inSelect.value.trim() !== '';
//         const hasOutTime = outSelect.value && outSelect.value.trim() !== '';

//         if (hasName && hasInTime && hasOutTime) {
//           hasValidEntry = true;
//         }
//       }
//     });

//     // Check skate guards (each needs name + in time + out time)
//     const skateGuards = [
//       { name: 'skate-guard-one', in: 'skate-guard-in-one', out: 'skate-guard-out-one' },
//       { name: 'skate-guard-two', in: 'skate-guard-in-two', out: 'skate-guard-out-two' }
//     ];

//     // Check if any skate guard has complete entry
//     skateGuards.forEach(guard => {
//       const nameSelect = document.getElementById(guard.name);
//       const inSelect = document.getElementById(guard.in);
//       const outSelect = document.getElementById(guard.out);

//       if (nameSelect && inSelect && outSelect) {
//         const hasName = nameSelect.value && nameSelect.value.trim() !== '';
//         const hasInTime = inSelect.value && inSelect.value.trim() !== '';
//         const hasOutTime = outSelect.value && outSelect.value.trim() !== '';

//         if (hasName && hasInTime && hasOutTime) {
//           hasValidEntry = true;
//         }
//       }
//     });

//     // Enable submit button if at least one complete entry exists
//     submitButton.disabled = !hasValidEntry;
//   }

//   // Add event listeners to all form elements
//   const allSelects = document.querySelectorAll('.name_picker_sched, .time_picker_sched');
//   allSelects.forEach(select => {
//     select.addEventListener('change', checkEnableSubmit);
//   });

//   // Initially disable submit button
//   submitButton.disabled = true;
// }

// Function to update the week header display
function updateWeekHeader(weekStart) {
  const weekHeader = document.getElementById("current-week");
  if (weekHeader) {
    weekHeader.textContent = formatWeekRange(weekStart);
  }
}

// Navigation functions
function prevWeek() {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  renderWeeklyCalendar(currentWeekStart);
  updateWeekHeader(currentWeekStart);
  return false;
}

function nextWeek() {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  renderWeeklyCalendar(currentWeekStart);
  updateWeekHeader(currentWeekStart);
  return false;
}

function goToCurrentWeek() {
  currentWeekStart = getWeekStart(new Date());
  renderWeeklyCalendar(currentWeekStart);
  updateWeekHeader(currentWeekStart);
}

// Initialization Block when DOM is loaded
document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);
  const date = params.get("date");
  const slot = params.get("slot");

  const slotFields = {
    driver_one_am: "driver-one-am",
    driver_two_am: "driver-two-am",
    driver_one_pm: "driver-one-pm",
    driver_two_pm: "driver-two-pm",
    skate_guard_one: "skate-guard-one",
    skate_guard_two: "skate-guard-two",
  };

  let selectedDate = null;

  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    const parsed = new Date(year, month - 1, day, 12);

    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
    ) {
      selectedDate = parsed;
      currentWeekStart = getWeekStart(parsed);
      currentMonth = parsed.getMonth();
      currentYear = parsed.getFullYear();
    }
  }

  renderWeeklyCalendar(currentWeekStart);
  updateWeekHeader(currentWeekStart);
  setupSubmitButtonListener();

  if (!selectedDate) return;

  await openScheduleModal(selectedDate);

  const fieldId = Object.hasOwn(slotFields, slot) ? slotFields[slot] : null;

  const field = fieldId ? document.getElementById(fieldId) : null;
  const modal = document.getElementById("cal_modal");

  if (field && !field.disabled && modal.classList.contains("modal_active")) {
    field.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    field.focus({ preventScroll: true });
  }
});

// Back to dashboard functionality
const backToDashboardLink = document.getElementById("link_back");
if (backToDashboardLink) {
  backToDashboardLink.addEventListener("click", function (event) {
    event.preventDefault();

    const userType =
      sessionStorage.getItem("currentUser") ||
      sessionStorage.getItem("session");
    if (userType) {
      const userTypeAcc = JSON.parse(userType);
      const userRole = userTypeAcc.accountType;

      if (userRole === "Manager") {
        window.location.href = "../../html/dashboards/manager.html";
      } else {
        window.location.href = "../../html/dashboards/employee.html";
      }
    }
  });
}

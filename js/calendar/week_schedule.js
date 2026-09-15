// Test Print
console.log("Week Schedule JS Loaded");

// Current date tracker
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth(); // 0-11 (January-December)
let currentDay = currentDate.getDay(); // 0-6 (Sunday-Saturday)
let currentDayName = currentDate.toLocaleString("default", {
  weekday: "short",
});

console.log(currentMonth + 1);
console.log(currentYear);
console.log(currentMonth);
console.log(currentDay);
console.log(currentDayName);

// Function to format date as a readable string
function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

// Function to update the display
function updateDayDisplay() {
  const dayElement = document.getElementById("current-day");
  const today = new Date();

  // Check if current date is today
  if (currentDate.toDateString() === today.toDateString()) {
    dayElement.textContent = "Today";
  } else {
    dayElement.textContent = formatDate(currentDate);
  }

  // Update employee hours display when date changes
  createEmployeeHoursDivs();
}

// Function to go to previous day
function prevDay() {
  currentDate.setDate(currentDate.getDate() - 1);
  updateDayDisplay();
}

// Function to go to next day
function nextDay() {
  currentDate.setDate(currentDate.getDate() + 1);
  updateDayDisplay();
}

// Initialize the display when page loads
document.addEventListener("DOMContentLoaded", function () {
  updateDayDisplay();
});

// Optional: Add keyboard navigation
document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") {
    prevDay();
  } else if (event.key === "ArrowRight") {
    nextDay();
  }
});

// Create div elements for each employee's hours based on the day selection
function createEmployeeHoursDivs() {
  const employeeHoursContainer = document.getElementById("zam-day-table");
  if (!employeeHoursContainer) {
    console.warn('Element with id "zam-day-table" not found.');
    return;
  }

  employeeHoursContainer.innerHTML = ""; // Clear previous content
  // Style the container
  employeeHoursContainer.style.display = "flex";
  employeeHoursContainer.style.flexDirection = "column";

  // Retrieve schedules data from local storage
  const schedules = JSON.parse(localStorage.getItem("schedules")) || [];
  // Check if schedules exist
  if (schedules.length === 0) {
    console.warn("No schedules found in local storage.");
    // Show a message to the user
    const noScheduleDiv = document.createElement("div");
    noScheduleDiv.innerHTML = "<p>No schedules available for this date.</p>";
    employeeHoursContainer.appendChild(noScheduleDiv);
    return;
  }

  // Filter schedules from updateDayDisplay function
  console.log(`Filtering schedules for date: ${currentDate.toDateString()}`);
  console.log("Current Date:", currentDate);
  console.log("Schedules from local storage:", schedules);

  // Fill in JS with date selected from the day selected button
  const selectedDate = currentDate.toISOString().split("T")[0]; // Format date as YYYY-MM-DD
  console.log("Selected Date:", selectedDate);

  // Filter schedules for the selected date
  const filteredSchedules = schedules.filter((schedule) => {
    return schedule.date === selectedDate;
  });

  // Check if any schedules match the selected date
  if (filteredSchedules.length === 0) {
    console.warn(`No schedules found for date: ${selectedDate}`);
    // Show a message to the user
    const noScheduleDiv = document.createElement("div");
    noScheduleDiv.innerHTML = `<p>No schedules found for ${formatDate(currentDate)}.</p>`;
    employeeHoursContainer.appendChild(noScheduleDiv);
    return;
  }

  // Check if we have drivers or skate guards before creating containers
  let hasDrivers = false;
  let hasSkateGuards = false;

  // Check what employee types exist in the filtered schedules
  filteredSchedules.forEach((schedule) => {
    if (schedule.drivers) {
      hasDrivers = true;
    }
    if (schedule.skate_guards || schedule.skateGuards) {
      hasSkateGuards = true;
    }
  });

  // Only create containers if we have employees for that role
  let driversContainer = null;
  let skateGuardsContainer = null;

  if (hasDrivers) {
    driversContainer = createRoleContainer("Drivers", employeeHoursContainer);
  }
  if (hasSkateGuards) {
    skateGuardsContainer = createRoleContainer(
      "Skate Guards",
      employeeHoursContainer,
    );
  }

  // Process each schedule
  filteredSchedules.forEach((schedule) => {
    // Handle drivers
    if (schedule.drivers && driversContainer) {
      if (Array.isArray(schedule.drivers)) {
        schedule.drivers.forEach((driver) => {
          createEmployeeDiv(driver, "Driver", driversContainer);
        });
      } else {
        createEmployeeDiv(schedule.drivers, "Driver", driversContainer);
      }
    }

    // Handle skate guards
    if (
      (schedule.skate_guards || schedule.skateGuards) &&
      skateGuardsContainer
    ) {
      const skateGuards = schedule.skate_guards || schedule.skateGuards;
      if (Array.isArray(skateGuards)) {
        skateGuards.forEach((guard) => {
          createEmployeeDiv(guard, "Skate Guard", skateGuardsContainer);
        });
      } else {
        createEmployeeDiv(skateGuards, "Skate Guard", skateGuardsContainer);
      }
    }
  });
}

// Helper function to create role containers
function createRoleContainer(title, parentContainer) {
  const roleContainer = document.createElement("div");
  roleContainer.className = "role-container";
  roleContainer.style.marginTop = "30px";
  roleContainer.style.marginBottom = "20px";

  // The Role Header
  const roleHeader = document.createElement("p");
  roleHeader.textContent = title;
  // Presentation rules for the role header
  roleHeader.className = "role-header";

  roleContainer.appendChild(roleHeader);
  parentContainer.appendChild(roleContainer);

  return roleContainer;
}

// Helper function to format name as first initial + last name
function formatName(fullName) {
  if (!fullName || typeof fullName !== "string") {
    return "N/A";
  }

  const nameParts = fullName.trim().split(" ");
  if (nameParts.length < 2) {
    return fullName; // Return as-is if no space found
  }

  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1]; // Get last part in case of middle names

  // Limit last name to 6 characters
  const truncatedLastName =
    lastName.length > 6 ? lastName.substring(0, 6) : lastName;

  return `${firstName.charAt(0).toUpperCase()}. ${truncatedLastName}`;
}

// Helper function to create individual employee divs
function createEmployeeDiv(employee, role, container) {
  const employeeDiv = document.createElement("div");
  employeeDiv.className = "employee-hours";
  // Style the employee div
  employeeDiv.style.display = "flex";
  employeeDiv.style.justifyContent = "space-between";
  employeeDiv.style.alignItems = "center";
  employeeDiv.style.padding = "10px";
  employeeDiv.style.border = "1px solid #0076cb98";
  employeeDiv.style.borderRadius = "10px";
  employeeDiv.style.marginBottom = "10px";
  employeeDiv.style.backgroundColor = "var(--input-background)";
  employeeDiv.style.fontSize = "0.9em";

  // Handle different possible time field names for skate guards and drivers
  let timeIn, timeOut;

  if (role === "Skate Guard") {
    // For skate guards, try different possible field names
    timeIn =
      employee.start_time ||
      employee.zam_in ||
      employee.in ||
      employee.time_in ||
      "N/A";
    timeOut =
      employee.end_time ||
      employee.zam_out ||
      employee.out ||
      employee.time_out ||
      "N/A";
  } else {
    // For drivers, use the original field names
    timeIn = employee.zam_in || employee.start_time || employee.in || "N/A";
    timeOut = employee.zam_out || employee.end_time || employee.out || "N/A";
  }

  // Format the name as first initial + last name
  const formattedName = formatName(employee.name);

  // Debug logging to see what we're getting
  console.log("Employee data:", employee);
  console.log("Role:", role);
  console.log("TimeIn:", timeIn);
  console.log("TimeOut:", timeOut);
  console.log("Formatted Name:", formattedName);

  // Check if any field displays "not needed" and hide the entire div if so
  // Fixed the condition - it was checking if timeIn/timeOut INCLUDES 'N/A', which would hide valid entries
  if (
    formattedName.toLowerCase().includes("Not Needed") ||
    timeIn === "N/A" ||
    timeOut === "N/A"
  ) {
    console.log("Hiding employee div due to N/A values");
    // employeeDiv.style.display = 'flex'; // or 'inline', 'flex', etc.
    employeeDiv.innerHTML = `
            <p class="zam-day-name">Not Needed today</p>
            <p class="zam-day-time"></p>
            <button class="edit-button" style="display:none;">
                <img src="../../img/edit-buttons/white-edit-pen.png" alt="Edit" style="width:18px;height:18px;vertical-align:middle;">`;
    return;
  }

  employeeDiv.innerHTML = `
        <p class="zam-day-name">${formattedName}</p>
        <p class="zam-day-time">${timeIn} - ${timeOut}</p>
        <button class="edit-button">
        <img src="../../img/edit-buttons/white-edit-pen.png" alt="Edit" style="width:18px;height:18px;vertical-align:middle;">
    </button>
    `;
  container.appendChild(employeeDiv);
}

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

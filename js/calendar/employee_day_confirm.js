console.log("employee_day_confirm.js loaded");

const savedEntryString = sessionStorage.getItem("lastTimeEntry");

if (!savedEntryString) {
  alert("No recently submitted time entry was found.");
  window.location.href = "employee_day.html";
} else {
  const savedEntry = JSON.parse(savedEntryString);

  const clockIn = new Date(savedEntry.clock_in);
  const clockOut = new Date(savedEntry.clock_out);

  if (Number.isNaN(clockIn.getTime()) || Number.isNaN(clockOut.getTime())) {
    alert("The saved time entry contains invalid date information.");
    window.location.href = "employee_day.html";
  } else {
    const dateEntered = document.getElementById("whole_date");
    const timeIn = document.getElementById("time_in");
    const timeOut = document.getElementById("time_out");

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });

    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    const clockInDate = dateFormatter.format(clockIn);
    const clockOutDate = dateFormatter.format(clockOut);

    dateEntered.textContent = clockInDate;
    timeIn.textContent = timeFormatter.format(clockIn);

    if (clockOutDate !== clockInDate) {
      timeOut.textContent = `${timeFormatter.format(clockOut)} (next day)`;
    } else {
      timeOut.textContent = timeFormatter.format(clockOut);
    }

    console.log("Confirmed database entry:", savedEntry);
  }
}

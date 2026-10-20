(() => {
  console.log("employee_day.js loaded");

  const submitButton = document.getElementById("submit_employee_hours");

  function convertTo24Hour(hourValue, period) {
    let hour = Number(hourValue);

    if (period === "AM" && hour === 12) {
      hour = 0;
    } else if (period === "PM" && hour !== 12) {
      hour += 12;
    }

    return hour;
  }

  function buildLocalDateTime(dateValue, hourValue, minuteValue, period) {
    const [year, month, day] = dateValue.split("-").map(Number);
    const hour = convertTo24Hour(hourValue, period);
    const minute = Number(minuteValue);

    return new Date(year, month - 1, day, hour, minute, 0, 0);
  }

  submitButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const currentUserString =
      sessionStorage.getItem("currentUser") ||
      sessionStorage.getItem("session");

    if (!currentUserString) {
      alert("No user is currently logged in. Please log in first.");
      window.location.href = "../../index.html";
      return;
    }

    const currentUser = JSON.parse(currentUserString);

    if (!Number.isInteger(Number(currentUser.id))) {
      alert("The logged-in employee does not have a valid user ID.");
      return;
    }

    if (currentUser.role !== "employee") {
      alert("Only employee accounts can submit hours.");
      return;
    }

    const datePicker = document.getElementById("current_day");
    const entryDate = datePicker.dataset.isoDate;

    if (!entryDate) {
      alert("A valid work date could not be determined.");
      return;
    }

    const clockIn = buildLocalDateTime(
      entryDate,
      document.getElementById("in_hour").value,
      document.getElementById("in_minute").value,
      document.getElementById("in_ampm").value,
    );

    const clockOut = buildLocalDateTime(
      entryDate,
      document.getElementById("out_hour").value,
      document.getElementById("out_minute").value,
      document.getElementById("out_ampm").value,
    );

    // A clock-out at or before clock-in represents an overnight shift.
    if (clockOut <= clockIn) {
      clockOut.setDate(clockOut.getDate() + 1);
    }

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
      const response = await fetch("http://localhost:3000/time-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(currentUser.id),
          clockIn: clockIn.toISOString(),
          clockOut: clockOut.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit hours");
      }

      // Temporarily retain the saved database response for the confirmation page.
      sessionStorage.setItem("lastTimeEntry", JSON.stringify(data));

      window.location.href = "../../html/calendar/employee_day_confirm.html";
    } catch (error) {
      console.error("Time-entry submission failed:", error);
      alert(error.message);

      submitButton.disabled = false;
      submitButton.textContent = "Submit Hours";
    }
  });
})();

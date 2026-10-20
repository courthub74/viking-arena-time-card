// Populate hours and minutes into the timepickers
// Enable the submit button when any of the timepickers are changed

console.log("punch_clock.js loaded");

// IN

// hours

// Query for the hour select element
const inHourSelect = document.getElementById("in_hour");
// Populate the hour select element with options from 1 to 12
for (let i = 1; i <= 12; i++) {
  // Create an option element for each hour
  const in_option = document.createElement("option");
  // Set the value and text content of the option element
  // value is set to each iteration
  in_option.value = i;
  // textContent is set to i, but if i is less than 10, it adds a leading zero
  in_option.textContent = i < 10 ? "0" + i : i;
  // Append the option element to the hour select element
  inHourSelect.appendChild(in_option);
  // Log the value of the option element to the console
  // This is for debugging purposes
  // console.log(in_option.value);
}

// minutes
const inMinuteSelect = document.getElementById("in_minute");
for (let i = 0; i < 60; i++) {
  const in_option = document.createElement("option");
  in_option.value = i;
  in_option.textContent = i < 10 ? "0" + i : i;
  if (i % 15 === 0) {
    in_option.value = i;
    in_option.textContent = i < 10 ? "0" + i : i;
    inMinuteSelect.appendChild(in_option);
  }
  // inMinuteSelect.appendChild(in_option);
}

// OUT

// hours
// Query for the hour select element
const outHourSelect = document.getElementById("out_hour");
// Populate the hour select element with options from 1 to 12
for (let i = 1; i <= 12; i++) {
  // Create an option element for each hour
  const out_option = document.createElement("option");
  // Set the value and text content of the option element
  // value is set to each iteration
  out_option.value = i;
  // textContent is set to i, and if less than 10, it adds a leading zero else just leave it as is
  out_option.textContent = i < 10 ? "0" + i : i;
  // Append the option element to the hour select element
  outHourSelect.appendChild(out_option);
}

// minutes
const outMinuteSelect = document.getElementById("out_minute");
for (let i = 0; i < 60; i++) {
  const out_option = document.createElement("option");
  out_option.value = i;
  out_option.textContent = i < 10 ? "0" + i : i;
  // just in increments of 15 minutes
  if (i % 15 === 0) {
    out_option.value = i;
    out_option.textContent = i < 10 ? "0" + i : i;
    outMinuteSelect.appendChild(out_option);
  }
  // outMinuteSelect.appendChild(out_option);
}

// Set current time as default
const now = new Date(); // This goes in the top date picker
// Query the DatePicker element
const datePicker = document.getElementById("current_day");
///////////////////////////////////////////////////////////////////////////
// Store the local date in a reliable format for the API.
const localYear = now.getFullYear();
const localMonth = String(now.getMonth() + 1).padStart(2, "0");
const localDay = String(now.getDate()).padStart(2, "0");

datePicker.dataset.isoDate = `${localYear}-${localMonth}-${localDay}`;

// Display a friendly date to the employee.
datePicker.value = now.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "2-digit",
});
///////////////////////////////////////////////////////////////////////////

datePicker.placeholder = now.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "2-digit",
});

// Populate In Hours
let in_hours = now.getHours() - 7; // Get the current hour and subtract 12 to convert to 12-hour format
const ampm = in_hours >= 12 ? "PM" : "AM";
in_hours = in_hours % 12;
in_hours = in_hours ? in_hours : 12; // Convert 0 to 12
inHourSelect.value = in_hours;

// Populate In Minutes
inMinuteSelect.value = now.getMinutes();
// set the minutes to 00
inMinuteSelect.value = 0; // Set the minutes to 00
document.getElementById("in_ampm").value = ampm;

// Populate Out Hours
let out_hours = now.getHours();
const out_ampm = out_hours >= 12 ? "PM" : "AM";
out_hours = out_hours % 12;
out_hours = out_hours ? out_hours : 12; // Convert 0 to 12
outHourSelect.value = out_hours;

// Populate Out Minutes
outMinuteSelect.value = now.getMinutes();
outMinuteSelect.value = 0; // Set the minutes to 15 minutes before the current time
document.getElementById("out_ampm").value = out_ampm;

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// SUBMIT BUTTON DISABLED BY DEFAULT FUNCTION

// Query the submit button element
const submitButton = document.getElementById("submit_employee_hours");

// Add event listener to the populate in hour select element
inHourSelect.addEventListener("change", function () {
  // Enable the submit button when the out hour is changed
  submitButton.disabled = false;
});

outHourSelect.addEventListener("change", function () {
  // Enable the submit button when the out hour is changed
  submitButton.disabled = false;
});

// Add event listener to the populate in minute select element
inMinuteSelect.addEventListener("change", function () {
  // Enable the submit button when the out hour is changed
  submitButton.disabled = false;
});
outMinuteSelect.addEventListener("change", function () {
  // Enable the submit button when the out hour is changed
  submitButton.disabled = false;
});
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

// FOR SUBMIT HOURS BUTTON

// // Add a click event listener to the button
// submitButton.addEventListener('click', function() {
//     // Get the selected values from the hour and minute select elements
//     const inHour = inHourSelect.value;
//     const inMinute = inMinuteSelect.value;
//     const outHour = outHourSelect.value;
//     const outMinute = outMinuteSelect.value;
//     // Get the selected value from the AM/PM select element
//     const inAmPm = document.getElementById('in_ampm').value;
//     const outAmPm = document.getElementById('out_ampm').value;
//     // Get the selected date from the DatePicker element
//     const date = datePicker.value;
//     // Log the selected values to the console
//     console.log(`In Time: ${inHour}:${inMinute} ${inAmPm}`);
//     console.log(`Out Time: ${outHour}:${outMinute} ${outAmPm}`);
//     console.log(`Date: ${date}`);

// });

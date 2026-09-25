const form = document.querySelector("form");
const submitAccountType = document.getElementById("submit_acct_type");
const jobTitleInputs = document.querySelectorAll('input[name="job_title"]');

// Enable the submit button after an employee position is selected
jobTitleInputs.forEach((input) => {
  input.addEventListener("change", () => {
    submitAccountType.disabled = false;
    console.log("Submit Button Enabled");
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const selectedJobTitle = document.querySelector(
    'input[name="job_title"]:checked',
  );

  if (!selectedJobTitle) {
    return;
  }

  const pendingRegistration = JSON.parse(
    sessionStorage.getItem("pendingRegistration"),
  );

  if (!pendingRegistration) {
    console.error("No pending registration was found.");
    return;
  }

  pendingRegistration.jobTitle = selectedJobTitle.value;

  sessionStorage.setItem(
    "pendingRegistration",
    JSON.stringify(pendingRegistration),
  );

  // Continue without placing registration data in the URL
  window.location.href = "confirmation.html";
});

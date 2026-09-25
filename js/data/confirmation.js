const API_BASE_URL = "http://localhost:3000";

const pendingRegistration = JSON.parse(
  sessionStorage.getItem("pendingRegistration"),
);

if (!pendingRegistration) {
  console.error("No pending registration was found.");
  window.location.href = "name.html";
} else {
  const confirmedName = document.getElementById("confirmed_name");
  const confirmedAccountType = document.getElementById("confirmed_acct_type");
  const confirmedPin = document.getElementById("confirmed_pin");

  const sidebarName = document.getElementById("profile_name");
  const sidebarAccountType = document.getElementById("profile_account");
  const confirmationButton = document.getElementById("confirmation_advance");

  const jobTitleLabels = {
    zamboni_driver: "Zamboni Driver",
    skate_instructor: "Skate Instructor",
    skate_guard: "Skate Guard",
  };

  const fullName = `${pendingRegistration.firstName} ${pendingRegistration.lastName}`;

  const jobTitleLabel =
    jobTitleLabels[pendingRegistration.jobTitle] ||
    pendingRegistration.jobTitle;

  confirmedName.textContent = fullName;
  confirmedAccountType.textContent = jobTitleLabel;
  confirmedPin.textContent = "••••";

  sidebarName.textContent = fullName;
  sidebarAccountType.textContent = jobTitleLabel;

  confirmationButton.textContent = "Complete registration";

  confirmationButton.addEventListener("click", async (event) => {
    event.preventDefault();

    confirmationButton.disabled = true;
    confirmationButton.textContent = "Creating account...";

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: pendingRegistration.firstName,
          lastName: pendingRegistration.lastName,
          jobTitle: pendingRegistration.jobTitle,
          pin: pendingRegistration.pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      const currentUser = {
        id: data.id,
        username: `${data.first_name} ${data.last_name}`,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        accountType: "Employee",
        // jobTitle: data.job_title,
        // Use the job title from the pending registration if the API response doesn't include it
        jobTitle: data.job_title || pendingRegistration.jobTitle,
        loginTime: new Date().toISOString(),
      };

      sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

      // Remove the temporary object, including the PIN
      sessionStorage.removeItem("pendingRegistration");

      const encodedUsername = encodeURIComponent(currentUser.username);

      window.location.href =
        `../dashboards/employee.html?username=${encodedUsername}` +
        `&acct_type=Employee`;
    } catch (error) {
      console.error(error);

      alert(error.message);

      confirmationButton.disabled = false;
      confirmationButton.textContent = "Complete registration";
    }
  });
}

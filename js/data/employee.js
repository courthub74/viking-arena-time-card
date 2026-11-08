document.addEventListener("DOMContentLoaded", async () => {
  const employeeName = document.getElementById("employee_name");
  const profileName = document.getElementById("profile_name");
  const profileAccount = document.getElementById("profile_account");

  if (employeeName) employeeName.textContent = "Checking session…";
  if (profileName) profileName.textContent = "";
  if (profileAccount) profileAccount.textContent = "";

  try {
    const response = await fetch("http://localhost:3000/session", {
      credentials: "include",
      cache: "no-store",
    });

    if (response.status === 401) {
      sessionStorage.removeItem("currentUser");
      window.location.replace("../../index.html");
      return;
    }

    if (!response.ok) {
      throw new Error(
        "Unable to verify your session. Please refresh to retry.",
      );
    }

    const { user } = await response.json();

    if (!user || !Number.isSafeInteger(user.id)) {
      throw new Error("The server returned an invalid session.");
    }

    if (user.role === "manager") {
      window.location.replace("./manager.html");
      return;
    }

    if (user.role !== "employee") {
      sessionStorage.removeItem("currentUser");
      window.location.replace("../../index.html");
      return;
    }

    const username = `${user.firstName} ${user.lastName}`.trim();

    // Keep compatibility with pages that read currentUser.
    // Authentication is verified by the API, not this stored object.
    const currentUser = {
      id: user.id,
      username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      accountType: "Employee",
      jobTitle: user.jobTitle,
    };

    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

    if (employeeName) employeeName.textContent = username;
    if (profileName) profileName.textContent = username;
    if (profileAccount) profileAccount.textContent = "Employee";
    document.body.classList.remove("session-checking");
  } catch (error) {
    document.body.classList.remove("session-checking");
    console.error("Employee session check failed:", error);

    sessionStorage.removeItem("currentUser");

    if (employeeName) {
      employeeName.textContent = "Session verification unavailable";
    }

    alert(error.message);
  }
});

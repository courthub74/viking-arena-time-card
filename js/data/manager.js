document.addEventListener("DOMContentLoaded", async () => {
  const managerName = document.getElementById("manager_name");
  const profileName = document.getElementById("profile_name");
  const profileAccount = document.getElementById("profile_account");

  if (managerName) managerName.textContent = "Checking session…";
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

    if (user.role === "employee") {
      sessionStorage.removeItem("currentUser");
      window.location.replace("./employee.html");
      return;
    }

    // Session Check
    if (user.role !== "manager") {
      window.location.replace("../../index.html");
      return;
    }

    const username = `${user.firstName} ${user.lastName}`.trim();

    // Cached profile details support existing pages.
    // The API session establishes identity and permissions.
    sessionStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: user.id,
        username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accountType: "Manager",
        jobTitle: user.jobTitle,
      }),
    );

    if (managerName) managerName.textContent = username;
    if (profileName) profileName.textContent = username;
    if (profileAccount) profileAccount.textContent = "Manager";

    document.body.classList.remove("session-checking");
  } catch (error) {
    console.error("Manager session check failed:", error);
    sessionStorage.removeItem("currentUser");

    if (managerName) {
      managerName.textContent = "Session verification unavailable";
    }

    document.body.classList.remove("session-checking");
    alert(error.message);
  }
});

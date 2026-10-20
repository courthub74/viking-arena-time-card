(() => {
  console.log("employee calendar.js loaded");

  const currentUserString =
    sessionStorage.getItem("currentUser") || sessionStorage.getItem("session");

  if (!currentUserString) {
    console.log("(calendar.js) No logged-in user was found.");
    window.location.href = "../../index.html";
    return;
  }

  const calendarCurrentUser = JSON.parse(currentUserString);

  console.log(
    `(calendar.js) Current user: ${calendarCurrentUser.username}; ` +
      `role: ${calendarCurrentUser.role}`,
  );

  const loggedName = calendarCurrentUser.username
    ? decodeURIComponent(calendarCurrentUser.username)
    : "Not Logged In";

  const loggedAccountType = calendarCurrentUser.accountType
    ? decodeURIComponent(calendarCurrentUser.accountType)
    : "Not Logged In";

  const calendarNameHeader = document.getElementById("employee_name");
  const sidebarNameHeader = document.getElementById("profile_calendar_name");
  const sidebarAccountTypeHeader = document.getElementById(
    "profile_calendar_account",
  );

  if (calendarNameHeader) {
    calendarNameHeader.textContent = loggedName;
  }

  if (sidebarNameHeader) {
    sidebarNameHeader.textContent = loggedName;
  }

  if (sidebarAccountTypeHeader) {
    sidebarAccountTypeHeader.textContent = loggedAccountType;
  }

  console.log(`(calendar.js) Logged-in name: ${loggedName}`);
  console.log(`(calendar.js) Logged-in account type: ${loggedAccountType}`);
})();

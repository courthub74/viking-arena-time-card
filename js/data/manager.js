//////////////////////////////////////////////////////////////////////
// THE ALGORITHM FOR GETTING FROM THE URL PARAMETERS
//////////////////////////////////////////////////////////////////////

console.log("(manager.js)The manager.js file is loaded.");

document.addEventListener("DOMContentLoaded", function () {
  ///////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////
  // REGISTRATION PART (I assume you don't have the session storage yet)
  ///////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////

  // Query the slide in profile name
  const slide_in_profile_name = document.getElementById("profile_name");
  // Query the slide in account type
  const slide_in_account_type = document.getElementById("profile_account");
  // Get logged in user from session storage
  // Get the name from the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const logged_name = urlParams.get("username")
    ? decodeURIComponent(urlParams.get("username"))
    : "Not Logged In";
  const logged_acct_type = urlParams.get("acct_type")
    ? decodeURIComponent(urlParams.get("acct_type"))
    : "N/A";
  // Set the sidebar elements to the logged in user
  slide_in_profile_name.innerHTML = logged_name;
  slide_in_account_type.innerHTML = logged_acct_type;

  // Query the name header
  const name_header = document.querySelector("#manager_name");
  // Set the name header to the logged in user
  name_header.innerHTML = logged_name;

  /////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  const storedCurrentUser = sessionStorage.getItem("currentUser");

  if (!storedCurrentUser) {
    console.log("(manager.js) No current user found. Redirecting to login.");

    window.location.replace("../../index.html");
    return;
  }

  const currentUser = JSON.parse(storedCurrentUser);

  if (currentUser.role !== "manager") {
    console.log("(manager.js) Current user does not have the manager role.");

    if (currentUser.role === "employee") {
      window.location.replace("./employee.html");
    } else {
      window.location.replace("../../index.html");
    }

    return;
  }

  console.log(
    `(manager.js) Current user: ${currentUser.username}; role: ${currentUser.role}`,
  );

  const loggedName = currentUser.username || "Not Logged In";
  const loggedAccountType = currentUser.accountType || "Not Logged In";

  const managerNameHeader = document.getElementById("manager_name");
  const sidebarNameHeader = document.getElementById("profile_name");
  const sidebarAccountTypeHeader = document.getElementById("profile_account");

  if (managerNameHeader) {
    managerNameHeader.textContent = loggedName;
  }

  if (sidebarNameHeader) {
    sidebarNameHeader.textContent = loggedName;
  }

  if (sidebarAccountTypeHeader) {
    sidebarAccountTypeHeader.textContent = loggedAccountType;
  }

  console.log(`(manager.js) Logged-in name: ${loggedName}`);
  console.log(`(manager.js) Logged-in account type: ${loggedAccountType}`);
});

// THE ALGRORITHM FOR GETTING FROM THE URL PARAMETERS

// Page One

// Query the input
// Get the input.value
// store it in a variable
// Encode the variable
// Redirect to the next page with URL parameters

// Page Two
// retrieve the URL parameters

//////////////////////////////////////////////////////////////////////
// THE ALGORITHM FOR GETTING FROM THE URL PARAMETERS
//////////////////////////////////////////////////////////////////////

// For the Header and slide ins on the dashboard page

// At the top of your JS file or in a DOMContentLoaded event listener
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
  const name_header = document.querySelector("#employee_name");

  // Set the name header to the logged in user
  name_header.innerHTML = logged_name;

  /////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  const storedCurrentUser = sessionStorage.getItem("currentUser");

  if (!storedCurrentUser) {
    console.log("(employee.js) No current user found. Redirecting to login.");

    window.location.replace("../../index.html");
    return;
  }

  const currentUser = JSON.parse(storedCurrentUser);

  if (currentUser.role !== "employee") {
    console.log("(employee.js) Current user does not have the employee role.");

    if (currentUser.role === "manager") {
      window.location.replace("./manager.html");
    } else {
      window.location.replace("../../index.html");
    }

    return;
  }

  console.log(
    `(employee.js) Current user: ${currentUser.username}; role: ${currentUser.role}`,
  );

  const loggedName = currentUser.username || "Not Logged In";
  const loggedAccountType = currentUser.accountType || "Not Logged In";

  const employeeNameHeader = document.getElementById("employee_name");
  const sidebarNameHeader = document.getElementById("profile_name");
  const sidebarAccountTypeHeader = document.getElementById("profile_account");

  if (employeeNameHeader) {
    employeeNameHeader.textContent = loggedName;
  }

  if (sidebarNameHeader) {
    sidebarNameHeader.textContent = loggedName;
  }

  if (sidebarAccountTypeHeader) {
    sidebarAccountTypeHeader.textContent = loggedAccountType;
  }

  console.log(`(employee.js) Logged-in name: ${loggedName}`);
  console.log(`(employee.js) Logged-in account type: ${loggedAccountType}`);
});

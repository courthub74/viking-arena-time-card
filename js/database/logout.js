// This file is responsible for handling the logout functionality of the application. It checks if a user is currently logged in by looking for a "currentUser" item in the sessionStorage. If no user is found, it redirects to the index page. If a user is found, it logs their username and account type to the console. The logoutUser function removes the "currentUser" and any legacy "session" from sessionStorage and redirects to the index page.
const storedCurrentUser = sessionStorage.getItem("currentUser");

if (!storedCurrentUser) {
  window.location.replace("../../index.html");
}

const currentUser = storedCurrentUser ? JSON.parse(storedCurrentUser) : null;

if (currentUser) {
  console.log(
    `The current user is ${currentUser.username} and their role is ${currentUser.accountType} (logout.js)`,
  );
}

function logoutUser() {
  if (currentUser) {
    console.log(
      `Logging out ${currentUser.username} (${currentUser.accountType})`,
    );
  }

  sessionStorage.removeItem("currentUser");

  // Remove any legacy session left from the localStorage version.
  sessionStorage.removeItem("session");

  window.location.replace("../../index.html");
}

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

// LOGOUT USER
let logoutInProgress = false;

async function logoutUser(event) {
  if (event) event.preventDefault();
  if (logoutInProgress) return;

  logoutInProgress = true;

  try {
    const response = await fetch("http://localhost:3000/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Logout failed. Please try again.");
    }

    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("session");
    sessionStorage.removeItem("lastTimeEntry");

    window.location.replace("../../index.html");
  } catch (error) {
    console.error("Logout failed:", error);
    alert(error.message);
  } finally {
    logoutInProgress = false;
  }
}

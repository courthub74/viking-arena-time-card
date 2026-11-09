// Handles explicit logout.
// Dashboard scripts verify authentication through the backend session.

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

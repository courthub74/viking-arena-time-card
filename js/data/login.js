// JS to read the names from the DB

// BASIC LOGIN ALGORITHM
// 1. Get the username and pin from the input fields
// 2. Validate the inputs (username and pin)
// 3. Check if the username exists in the database (LocalStorage)
// 4. If the username exists, check if the pin matches the one in the database
// 5. If the pin matches, log the user in and redirect to the appropriate page
// 6. If the pin doesn't match, keep the login button disabled and turn the clear pins field into notification colors

// NOTES:
// - The login function should be called when the user clicks the login button
// An event listener to the dropdown to read the name selected and match it to the DB or LocalStorage
// Then match that selection to the pin number associated with that name
// then compare the entered pin number to the one in the DB or LocalStorage
// Then if the pin number is correct, add the appropriate colors to the pin number inputs
// enable the submit button, (if incorrect keep the submit button disabled)

// Now we are implementing PostgreSQL to store the user data instead of LocalStorage. The login function will now send a POST request to the backend server with the username and pin, and the server will validate the inputs and check the database for the user and pin match. If successful, it will return a success message and user data, otherwise it will return an error message.

const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("submit_login");
  const pinFields = document.querySelectorAll(".pin_put");
  const usersDropdown = document.getElementById("users_dropdown");
  const clearPinsButton = document.getElementById("reset_button");
  const forgotPinButton = document.getElementById("forgot_button");

  let authenticatedUser = null;
  let loginRequestInProgress = false;

  loginButton.disabled = true;

  loadUsers();

  async function loadUsers() {
    usersDropdown.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "";
    defaultOption.selected = true;
    defaultOption.disabled = true;
    usersDropdown.appendChild(defaultOption);

    try {
      const response = await fetch(`${API_URL}/users`);

      if (!response.ok) {
        throw new Error("Failed to retrieve users");
      }

      const users = await response.json();

      users.forEach((user) => {
        const option = document.createElement("option");

        // Use the database ID rather than the user's name.
        option.value = user.id;
        option.textContent = `${user.first_name} ${user.last_name}`;

        usersDropdown.appendChild(option);
      });
    } catch (error) {
      console.error(error);
      showStatus("Unable to load users", false);
    }
  }

  usersDropdown.addEventListener("change", () => {
    authenticatedUser = null;
    loginButton.disabled = true;
    clearPinFields();

    setTimeout(() => {
      pinFields[0]?.focus();
    }, 100);
  });

  pinFields.forEach((input, index) => {
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("maxlength", "1");

    input.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && input.value.length === 0 && index > 0) {
        pinFields[index - 1].focus();
      }
    });

    input.addEventListener("input", async () => {
      input.value = input.value.replace(/\D/g, "").slice(0, 1);

      if (input.value && index < pinFields.length - 1) {
        pinFields[index + 1].focus();
      }

      const pin = getEnteredPin();

      if (pin.length === 4) {
        await verifyLogin(pin);
      }
    });
  });

  async function verifyLogin(pin) {
    const userId = usersDropdown.value;

    if (!userId) {
      showStatus("Select a user first", false);
      clearPinFields();
      usersDropdown.focus();
      return;
    }

    if (loginRequestInProgress) {
      return;
    }

    loginRequestInProgress = true;
    loginButton.disabled = true;

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(userId),
          pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        authenticatedUser = null;
        showStatus(data.error || "Invalid user or PIN", false);

        setTimeout(() => {
          clearPinFields();
          pinFields[0]?.focus();
        }, 2000);

        return;
      }

      authenticatedUser = data.user;
      loginButton.disabled = false;

      pinFields.forEach((field) => {
        const isDarkMode = document.body.classList.contains("dark-mode");
        field.style.color = isDarkMode ? "#00FF00" : "#16BC00";
      });

      showStatus("PIN is Correct", true);
      loginButton.focus();
    } catch (error) {
      console.error(error);
      authenticatedUser = null;
      showStatus("Login service unavailable", false);

      setTimeout(() => {
        clearPinFields();
        pinFields[0]?.focus();
      }, 2000);
    } finally {
      loginRequestInProgress = false;
    }
  }

  loginButton.addEventListener("click", (event) => {
    event.preventDefault();

    if (!authenticatedUser) {
      return;
    }

    const username =
      `${authenticatedUser.firstName} ${authenticatedUser.lastName}`.trim();

    const accountType =
      authenticatedUser.role === "manager" ? "Manager" : "Employee";

    // This preserves the information existing pages may expect,
    // but deliberately excludes the PIN.
    sessionStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: authenticatedUser.id,
        username,
        firstName: authenticatedUser.firstName,
        lastName: authenticatedUser.lastName,
        role: authenticatedUser.role,
        accountType,
        loginTime: new Date().toISOString(),
      }),
    );

    const query =
      `?username=${encodeURIComponent(username)}` +
      `&acct_type=${encodeURIComponent(accountType)}`;

    if (authenticatedUser.role === "manager") {
      window.location.href = `./html/dashboards/manager.html${query}`;
    } else {
      window.location.href = `./html/dashboards/employee.html${query}`;
    }
  });

  clearPinsButton.addEventListener("click", (event) => {
    event.preventDefault();
    authenticatedUser = null;
    loginButton.disabled = true;
    clearPinFields();
    resetStatus();
    pinFields[0]?.focus();
  });

  forgotPinButton.addEventListener("click", () => {
    window.location.href = "./html/forgot_pin.html";
  });

  function getEnteredPin() {
    return [...pinFields].map((field) => field.value).join("");
  }

  function clearPinFields() {
    pinFields.forEach((field) => {
      field.value = "";
      field.style.color = "";
    });
  }

  function showStatus(message, success) {
    clearPinsButton.textContent = message;
    clearPinsButton.style.opacity = "100%";
    clearPinsButton.style.color = success ? "#16BC00" : "#BC0000";
    forgotPinButton.style.opacity = "0%";
  }

  function resetStatus() {
    const isDarkMode = document.body.classList.contains("dark-mode");

    clearPinsButton.textContent = "Clear Pin fields";
    clearPinsButton.style.color = isDarkMode ? "#ffffff" : "#000000";
    clearPinsButton.style.opacity = isDarkMode ? "55%" : "70%";
    forgotPinButton.style.opacity = "100%";
  }
});

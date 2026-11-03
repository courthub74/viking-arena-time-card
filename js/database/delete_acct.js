(() => {
  const api = "http://localhost:3000";
  const pins = [...document.querySelectorAll(".pin_put")];
  const openButton = document.getElementById("delete_acct");
  const confirmButton = document.getElementById("confirm_delete");
  const cancelButton = document.getElementById("cancel_delete");
  const clearButton = document.getElementById("reset_button");
  const forgotButton = document.getElementById("forgot_button");
  const backButton = document.getElementById("link_back_delete");
  const modal = document.getElementById("confirmation_modal");

  let currentUser = null;
  let saving = false;

  const readPin = () => pins.map((input) => input.value).join("");

  function updateButton() {
    openButton.disabled = saving || !currentUser || !/^\d{4}$/.test(readPin());
  }

  function clearPins() {
    pins.forEach((input) => {
      input.value = "";
      input.style.color = "";
    });

    updateButton();
    pins[0].focus();
  }

  function returnToLogin() {
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("session");
    window.location.replace("../../index.html");
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  // These buttons are inside a form.
  [
    openButton,
    confirmButton,
    cancelButton,
    clearButton,
    forgotButton,
    backButton,
  ].forEach((button) => {
    if (button) button.type = "button";
  });

  openButton.disabled = true;
  confirmButton.disabled = true;

  pins.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "").slice(0, 1);

      if (input.value && index < pins.length - 1) {
        pins[index + 1].focus();
      }

      updateButton();
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && !input.value && index > 0) {
        pins[index - 1].focus();
      }
    });
  });

  clearButton.addEventListener("click", clearPins);

  forgotButton.addEventListener("click", () => {
    alert("PIN recovery is not available yet.");
  });

  openButton.addEventListener("click", () => {
    if (openButton.disabled) return;

    // PIN correctness is checked only by the server on confirmation.
    modal.classList.add("modal_active");
  });

  cancelButton.addEventListener("click", () => {
    if (saving) return;

    modal.classList.remove("modal_active");
    clearPins();
  });

  backButton.addEventListener("click", () => {
    if (saving || !currentUser) return;

    window.location.href =
      currentUser.role === "manager"
        ? "../dashboards/manager.html"
        : "../dashboards/employee.html";
  });

  confirmButton.addEventListener("click", async () => {
    if (saving || !currentUser) return;

    const pin = readPin();
    if (!/^\d{4}$/.test(pin)) return;

    saving = true;
    updateButton();
    confirmButton.disabled = true;
    cancelButton.disabled = true;
    confirmButton.textContent = "Deactivating…";

    try {
      const response = await fetch(`${api}/account/deactivate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (response.status === 401) {
        returnToLogin();
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to deactivate account");
      }

      returnToLogin();
    } catch (error) {
      alert(error.message);
      modal.classList.remove("modal_active");
      clearPins();
    } finally {
      saving = false;
      confirmButton.disabled = !currentUser;
      cancelButton.disabled = false;
      confirmButton.textContent = "Yes, Deactivate";
      updateButton();
    }
  });

  async function loadProfile() {
    try {
      const response = await fetch(`${api}/session`, {
        credentials: "include",
      });

      if (response.status === 401) {
        returnToLogin();
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to verify your login. Reload the page.");
      }

      const data = await response.json();
      currentUser = data.user;

      if (!currentUser) {
        throw new Error("No user profile was returned");
      }

      const name = `${currentUser.firstName} ${currentUser.lastName}`;
      const role = currentUser.role === "manager" ? "Manager" : "Employee";

      [
        "employee_name",
        "employee_name_delete",
        "confirm_employee_name",
        "profile_name",
      ].forEach((id) => setText(id, name));

      setText("confirm_account_type", role);
      setText("profile_account", role);

      confirmButton.disabled = false;
      updateButton();
    } catch (error) {
      currentUser = null;
      updateButton();
      confirmButton.disabled = true;
      alert(error.message);
    }
  }

  loadProfile();
})();

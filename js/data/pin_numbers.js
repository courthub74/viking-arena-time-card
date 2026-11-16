(() => {
  const PIN_LENGTH = 6;

  const pinInputs = [...document.querySelectorAll(".pin_put_set")];
  const confirmInputs = [...document.querySelectorAll(".pin_put_confirm")];
  const submitButton = document.getElementById("submit_login");
  const resetButton = document.getElementById("reset_button");

  const allInputs = [...pinInputs, ...confirmInputs];

  function readPin(inputs) {
    return inputs.map((input) => input.value).join("");
  }

  // Validate PIN format and predictability
  function getPinError(pin) {
    if (!/^\d{6}$/.test(pin)) {
      return "PIN must contain exactly six digits";
    }

    if (
      /^(\d)\1{5}$/.test(pin) ||
      /^(\d{2})\1{2}$/.test(pin) ||
      /^(\d{3})\1$/.test(pin) ||
      "0123456789".includes(pin) ||
      "9876543210".includes(pin)
    ) {
      return "Choose a less predictable PIN—avoid repeats and counting sequences.";
    }

    return null;
  }

  function pinsMatch() {
    return (
      pinInputs.length === PIN_LENGTH &&
      confirmInputs.length === PIN_LENGTH &&
      allInputs.every((input) => /^\d$/.test(input.value)) &&
      readPin(pinInputs) === readPin(confirmInputs)
    );
  }

  function validate() {
    const firstRowComplete =
      pinInputs.length === PIN_LENGTH &&
      pinInputs.every((input) => /^\d$/.test(input.value));

    const complete =
      firstRowComplete &&
      confirmInputs.length === PIN_LENGTH &&
      confirmInputs.every((input) => /^\d$/.test(input.value));

    const pinError = firstRowComplete ? getPinError(readPin(pinInputs)) : null;

    const matches = pinsMatch();
    const valid = matches && !pinError;

    const darkMode = document.body.classList.contains("dark-mode");
    const successColor = darkMode ? "#00FF00" : "#16BC00";

    let message = "Clear Pin fields";
    let color = "";

    if (pinError) {
      message = pinError;
      color = "#FF0000";
    } else if (complete) {
      message = matches ? "PINs Match" : "PINs don't match";
      color = matches ? successColor : "#FF0000";
    }

    submitButton.disabled = !valid;

    allInputs.forEach((input) => {
      input.style.color = color;
    });

    resetButton.textContent = message;
    resetButton.style.color = color;
    resetButton.style.opacity = color ? "1" : "";

    return valid;
  }

  function configureRow(inputs, nextRow) {
    inputs.forEach((input, index) => {
      input.setAttribute("inputmode", "numeric");
      input.setAttribute("maxlength", "1");

      input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "").slice(0, 1);
        validate();

        if (!input.value) return;

        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        } else if (
          nextRow &&
          inputs.every((field) => /^\d$/.test(field.value))
        ) {
          nextRow[0]?.focus();
        } else if (pinsMatch() && !getPinError(readPin(pinInputs))) {
          submitButton.focus();
        }
      });

      input.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && input.value === "" && index > 0) {
          event.preventDefault();
          inputs[index - 1].value = "";
          inputs[index - 1].focus();
          validate();
        }
      });
    });
  }

  configureRow(pinInputs, confirmInputs);
  configureRow(confirmInputs);

  resetButton.addEventListener("click", (event) => {
    event.preventDefault();

    allInputs.forEach((input) => {
      input.value = "";
    });

    validate();
    pinInputs[0]?.focus();
  });

  submitButton.addEventListener("click", (event) => {
    event.preventDefault();

    if (!validate()) return;

    const pendingRegistration = JSON.parse(
      sessionStorage.getItem("pendingRegistration"),
    );

    if (!pendingRegistration) {
      window.location.replace("name.html");
      return;
    }

    pendingRegistration.pin = readPin(confirmInputs);

    sessionStorage.setItem(
      "pendingRegistration",
      JSON.stringify(pendingRegistration),
    );

    window.location.href = "acct_type.html";
  });

  validate();
  pinInputs[0]?.focus();
})();

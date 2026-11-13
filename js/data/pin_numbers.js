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

  function pinsMatch() {
    return (
      pinInputs.length === PIN_LENGTH &&
      confirmInputs.length === PIN_LENGTH &&
      allInputs.every((input) => /^\d$/.test(input.value)) &&
      readPin(pinInputs) === readPin(confirmInputs)
    );
  }

  function validate() {
    const complete =
      pinInputs.length === PIN_LENGTH &&
      confirmInputs.length === PIN_LENGTH &&
      allInputs.every((input) => /^\d$/.test(input.value));

    const matches = pinsMatch();
    const darkMode = document.body.classList.contains("dark-mode");
    const successColor = darkMode ? "#00FF00" : "#16BC00";

    submitButton.disabled = !matches;

    allInputs.forEach((input) => {
      input.style.color = complete ? (matches ? successColor : "#FF0000") : "";
    });

    resetButton.textContent = complete
      ? matches
        ? "PINs Match"
        : "PINs don't match"
      : "Clear Pin fields";

    resetButton.style.color = complete
      ? matches
        ? successColor
        : "#FF0000"
      : "";

    resetButton.style.opacity = complete ? "1" : "";
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
        } else if (pinsMatch()) {
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
    validate();

    if (!pinsMatch()) return;

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

(() => {
  const form = document.getElementById("accept_invitation_form");
  const token = document.getElementById("invitation_code");
  const firstName = document.getElementById("firstname");
  const lastName = document.getElementById("lastname");
  const pin = document.getElementById("manager_pin");
  const confirmPin = document.getElementById("confirm_pin");
  const button = document.getElementById("accept_invitation");
  const notify = document.getElementById("invitation_notify");

  let saving = false;
  let completed = false;

  function showPinMatch() {
    const match = document.querySelector("#pin_match_confirm .match_");
    const mismatch = document.querySelector("#pin_match_confirm .no_match");

    match.classList.remove("entered");
    mismatch.classList.remove("entered");

    if (saving || completed) return;

    const bothComplete =
      /^\d{4}$/.test(pin.value) && /^\d{4}$/.test(confirmPin.value);

    if (!bothComplete) return;

    if (pin.value === confirmPin.value) {
      match.classList.add("entered");
    } else {
      mismatch.classList.add("entered");
    }
  }

  function validate() {
    confirmPin.setCustomValidity(
      confirmPin.value && pin.value !== confirmPin.value
        ? "PINs must match."
        : "",
    );

    const valid =
      /^[a-f0-9]{64}$/.test(token.value.trim()) &&
      firstName.value.trim().length > 0 &&
      lastName.value.trim().length > 0 &&
      firstName.value.trim().length <= 50 &&
      lastName.value.trim().length <= 50 &&
      /^\d{4}$/.test(pin.value) &&
      pin.value === confirmPin.value;

    button.disabled = saving || completed || !valid;
  }

  // Input and Change Listeners
  form.addEventListener("input", validate);
  form.addEventListener("change", validate);

  pin.addEventListener("input", showPinMatch);
  confirmPin.addEventListener("input", showPinMatch);
  pin.addEventListener("change", showPinMatch);
  confirmPin.addEventListener("change", showPinMatch);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    validate();

    if (button.disabled || !form.reportValidity()) return;

    saving = true;
    button.disabled = true;
    button.textContent = "Creating…";
    notify.textContent = "";

    try {
      const response = await fetch(
        "http://localhost:3000/manager/invitations/redeem",
        {
          method: "POST",
          credentials: "omit",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: token.value.trim(),
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            pin: pin.value,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to create manager account.");
      }

      completed = true;
      form.reset();

      form.querySelectorAll("input").forEach((input) => {
        input.disabled = true;
      });

      button.textContent = "Account Created";
      notify.textContent =
        "Your manager account was created. Select Back to Login to sign in.";
    } catch (error) {
      notify.textContent = error.message;
      button.textContent = "Create Manager Account";
    } finally {
      saving = false;
      validate();
    }
  });

  showPinMatch();
  validate();
})();

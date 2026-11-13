(async () => {
  const form = document.getElementById("manager_invitation_form");
  const generateButton = document.getElementById("generate_invitation");
  const status = document.getElementById("invitation_status");
  const resultPanel = document.getElementById("invitation_result");
  const tokenField = document.getElementById("invitation_token");
  const expiry = document.getElementById("invitation_expiry");
  const copyButton = document.getElementById("copy_invitation");

  let saving = false;

  // Verify the session before enabling invitation creation.
  try {
    const response = await fetch("http://localhost:3000/session", {
      credentials: "include",
      cache: "no-store",
    });

    if (response.status === 401) {
      window.location.replace("../../index.html");
      return;
    }

    const data = await response.json();

    if (!response.ok || !data.user) {
      throw new Error("Unable to verify your session.");
    }

    if (data.user.role !== "manager") {
      status.textContent = "Manager access required.";
      return;
    }

    const name = `${data.user.firstName} ${data.user.lastName}`;

    document.getElementById("manager_name").textContent = name;
    document.getElementById("profile_name").textContent = name;
    document.getElementById("profile_account").textContent = "Manager";

    generateButton.disabled = false;
  } catch (error) {
    status.textContent = error.message;
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (saving || generateButton.disabled) return;

    saving = true;
    generateButton.disabled = true;
    generateButton.textContent = "Creating…";
    status.textContent = "";

    try {
      const response = await fetch(
        "http://localhost:3000/manager/invitations",
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        },
      );

      if (response.status === 401) {
        window.location.replace("../../index.html");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create invitation.");
      }

      tokenField.value = data.invitation.token;
      expiry.textContent =
        "Expires: " + new Date(data.invitation.expiresAt).toLocaleString();

      resultPanel.hidden = false;
      status.textContent = "Invitation created.";
      generateButton.textContent = "Invitation Created";
    } catch (error) {
      status.textContent = error.message;
      generateButton.textContent = "Create Invitation";
      generateButton.disabled = false;
    } finally {
      saving = false;
    }
  });

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(tokenField.value);

      const check = document.createElement("img");
      check.src = "../../img/pins-match/match.png";
      check.alt = "";
      check.className = "copy_success_icon";

      status.replaceChildren("Invitation code copied. ", check);
    } catch {
      tokenField.focus();
      tokenField.select();
      status.textContent =
        "Copy automatically was unavailable. Press Command+C or Ctrl+C.";
    }
  });
})();

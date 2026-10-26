(() => {
  const API = "http://localhost:3000";

  async function getJson(path) {
    const response = await fetch(`${API}${path}`, {
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.replace("../../index.html");
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to load employee hours.");
    }

    return data;
  }

  function createRow(entry) {
    const clockIn = new Date(entry.clock_in);
    const clockOut = new Date(entry.clock_out);

    const day = clockIn.toLocaleDateString("en-US", {
      weekday: "short",
    });
    const month = clockIn.toLocaleDateString("en-US", {
      month: "short",
    });
    const date = clockIn.toLocaleDateString("en-US", {
      day: "2-digit",
    });

    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };

    const inTime = clockIn.toLocaleTimeString("en-US", timeOptions);
    const outTime = clockOut.toLocaleTimeString("en-US", timeOptions);

    const li = document.createElement("li");
    li.style.listStyleType = "none";

    const row = document.createElement("div");
    row.className = "emp_hours_list";

    function addElement(tag, className, text) {
      const element = document.createElement(tag);
      element.className = className;
      element.textContent = text;
      row.appendChild(element);
      return element;
    }

    const dayElement = addElement("div", "emp_hours_list_item", day);
    dayElement.style.fontWeight = "bold";

    addElement("span", "pipe", "|");
    addElement("div", "emp_hours_list_item", month);
    addElement("span", "comma", ",");
    addElement("div", "emp_hours_list_item", date);
    addElement("span", "pipe", "|");
    addElement("div", "emp_hours_list_item", inTime);
    addElement("span", "line", "-");
    addElement("div", "emp_hours_list_item", outTime);

    const copyButton = addElement("button", "copy-button", "Copy");
    copyButton.type = "button";

    copyButton.addEventListener("click", async () => {
      const startDate = clockIn.toLocaleDateString("en-US");
      const endDate = clockOut.toLocaleDateString("en-US");

      // Include the end date when the shift runs overnight.
      const endText = startDate === endDate ? outTime : `${endDate} ${outTime}`;

      try {
        await navigator.clipboard.writeText(
          `${startDate} | ${inTime} | ${endText}`,
        );

        copyButton.textContent = "✓Copied";
        copyButton.classList.add("copied");
      } catch (error) {
        console.error("Copy failed:", error);
        copyButton.textContent = "Try again";
      }

      setTimeout(() => {
        copyButton.textContent = "Copy";
        copyButton.classList.remove("copied");
      }, 2500);
    });

    li.appendChild(row);
    return li;
  }

  async function initializeEmployeeHours() {
    const hoursContainer = document.getElementById("emp_hours");
    const employeeName = document.getElementById("emp_name_box");

    if (!hoursContainer || !employeeName) return;

    employeeName.textContent = "Employee";
    hoursContainer.textContent = "Loading hours…";

    try {
      const session = await getJson("/session");
      if (!session) return;

      const manager = session.user;

      if (manager.role !== "manager") {
        window.location.replace("../../html/dashboards/employee.html");
        return;
      }

      const managerName = `${manager.firstName} ${manager.lastName}`.trim();

      for (const id of ["manager_name", "profile_scheduler_name"]) {
        const element = document.getElementById(id);
        if (element) element.textContent = managerName;
      }

      const account = document.getElementById("profile_scheduler_account");
      if (account) account.textContent = "Manager";

      const params = new URLSearchParams(window.location.search);
      const userId = Number(params.get("userId"));

      if (!Number.isSafeInteger(userId) || userId <= 0) {
        throw new Error("Select an employee from the employee hours list.");
      }

      const data = await getJson(`/manager/employees/${userId}/time-entries`);
      if (!data) return;

      employeeName.textContent =
        `${data.employee.first_name} ${data.employee.last_name}`.trim();

      hoursContainer.replaceChildren();

      if (data.timeEntries.length === 0) {
        hoursContainer.textContent = "No hours recorded for this employee.";
        return;
      }

      data.timeEntries.forEach((entry) => {
        hoursContainer.appendChild(createRow(entry));
      });
    } catch (error) {
      console.error("Failed to load employee hours:", error);
      hoursContainer.textContent = error.message;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeEmployeeHours, {
      once: true,
    });
  } else {
    initializeEmployeeHours();
  }
})();

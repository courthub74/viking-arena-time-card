(() => {
  async function initializeManagerEmployees() {
    const container = document.getElementById("employee_hours_buttons");
    if (!container) return;

    container.textContent = "Loading employees…";

    try {
      const sessionResponse = await fetch("http://localhost:3000/session", {
        credentials: "include",
      });
      const sessionData = await sessionResponse.json();

      if (sessionResponse.status === 401) {
        window.location.replace("../../index.html");
        return;
      }

      if (!sessionResponse.ok) {
        throw new Error(sessionData.error || "Failed to check login session");
      }

      const manager = sessionData.user;

      if (manager.role !== "manager") {
        window.location.replace("../../html/dashboards/employee.html");
        return;
      }

      const managerName = `${manager.firstName} ${manager.lastName}`.trim();

      for (const id of ["manager_name", "profile_scheduler_name"]) {
        const element = document.getElementById(id);
        if (element) element.textContent = managerName;
      }

      const accountElement = document.getElementById(
        "profile_scheduler_account",
      );
      if (accountElement) accountElement.textContent = "Manager";

      const response = await fetch("http://localhost:3000/manager/employees", {
        credentials: "include",
      });
      const employees = await response.json();

      if (!response.ok) {
        throw new Error(employees.error || "Failed to retrieve employees");
      }

      container.replaceChildren();

      if (employees.length === 0) {
        container.textContent = "No employees found.";
        return;
      }

      employees.forEach((employee) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "employee_hours_btn";

        const name = document.createElement("p");
        name.className = "employee_name";
        name.textContent =
          `${employee.first_name} ${employee.last_name}`.trim();

        const clock = document.createElement("img");
        clock.src = "../../img/dashboard_logos/blue_hours.png";
        clock.className = "emp_clock";
        clock.alt = "";

        button.append(name, clock);

        button.addEventListener("click", () => {
          window.location.href =
            "../../html/manager/emp_hours_list.html" +
            `?userId=${encodeURIComponent(employee.id)}`;
        });

        container.appendChild(button);
      });
    } catch (error) {
      console.error("Failed to load manager employee list:", error);
      container.textContent = error.message;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeManagerEmployees, {
      once: true,
    });
  } else {
    initializeManagerEmployees();
  }
})();

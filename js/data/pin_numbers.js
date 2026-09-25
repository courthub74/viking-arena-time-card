// Query the pin inputs by whole div

// Query Set Pin field
const pin_set = document.querySelectorAll(".pin_put_set");

// Query Confirm Pin field
const pin_confirm = document.querySelectorAll(".pin_put_confirm");

// Query Submit Button
const submit_pins = document.getElementById("submit_login");

// Query the reset pins button
const reset_pins = document.getElementById("reset_button");

// Query Match Confirm

// Match
let match_notify = document.querySelector(".match_");

// No Match
let no_match_notify = document.querySelector(".no_match");

// Query the form
const form = document.querySelector("form");

// Optional: Auto-focus the first input when the page loads
document.addEventListener("DOMContentLoaded", (e) => {
  e.preventDefault();
  // Focus the first PIN input when the page loads
  const firstPinInput = document.querySelector(".pin_put_set");
  if (firstPinInput) {
    console.log("Auto-focus the first input");
    firstPinInput.focus();
  }
});

//////// NUMERIC INPUT BEHAVIOR (for mobile devices) ////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
// Get all PIN inputs for the pin set and confirm fields for numeric input
const pinInputs = document.querySelectorAll(".pin_put_set");

const pinInputsConfirm = document.querySelectorAll(".pin_put_confirm");

// For set pin inputs
pinInputs.forEach((input, index) => {
  // Add input type="number" or pattern attribute to HTML elements
  input.setAttribute("inputmode", "numeric"); // Shows number keyboard on mobile

  // Prevent non-numeric input
  input.addEventListener("keypress", function (event) {
    // Allow only digits (0-9)
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  });

  // Clean any non-numeric characters that might get pasted
  input.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");

    // Move to next input when a digit is entered
    if (this.value.length === 1 && index < pinInputs.length - 1) {
      pinInputs[index + 1].focus();
    }
  });

  // Handle backspace to go to previous input
  input.addEventListener("keydown", function (event) {
    if (event.key === "Backspace" && this.value.length === 0 && index > 0) {
      pinInputs[index - 1].focus();
    }
  });
});

// For confirm pin inputs
pinInputsConfirm.forEach((input, index) => {
  // Add input type="number" or pattern attribute to HTML elements
  input.setAttribute("inputmode", "numeric"); // Shows number keyboard on mobile
  // Prevent non-numeric input
  input.addEventListener("keypress", function (event) {
    // Allow only digits (0-9)
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  });

  // Clean any non-numeric characters that might get pasted
  input.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");

    // Move to next input when a digit is entered
    if (this.value.length === 1 && index < pinInputsConfirm.length - 1) {
      pinInputsConfirm[index + 1].focus();
    }
  });

  // Handle backspace to go to previous input
  input.addEventListener("keydown", function (event) {
    if (event.key === "Backspace" && this.value.length === 0 && index > 0) {
      pinInputsConfirm[index - 1].focus();
    }
  });
});

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
// JS for pin puts for key behavior

// First Row
pin_set.forEach((input, key) => {
  // Add event listener function to input that iterates through the inputs
  input.addEventListener("keyup", (e) => {
    if (input.value) {
      // If all 4 inputs are filled, focus on the first confirm input
      if (key === 3) {
        // Let's read the Pin Nums for matching to the confirm pin
        const pin_set_value = [...pin_set]
          .map((each_pin_set) => each_pin_set.value)
          .join("");
        // Print digits to console
        console.log(`The First Pin #: ${pin_set_value}`);
        // Focus on the first confirm input
        pin_confirm[0].focus();
      } else {
        // Focus on the next input
        pin_set[key + 1].focus();
      }
    }
  });
});

// Second Row
pin_confirm.forEach((input_2, key_2) => {
  // Add event listener function to input that iterates through the inputs
  input_2.addEventListener("keyup", (e) => {
    if (input_2.value) {
      // If all 4 inputs are filled, focus on the submit button
      if (key_2 === 3) {
        // Let's read the Pin Nums for matching to the confirm pin
        const pin_confirm_value = [...pin_confirm]
          .map((each_pin_confirm) => each_pin_confirm.value)
          .join("");
        // Print digits to console
        console.log(`The Confirm Pin #: ${pin_confirm_value}`);
        // Focus on the submit button
        submit_pins.focus();
      } else {
        // Focus on the next input
        pin_confirm[key_2 + 1].focus();
      }
    }
  });
});

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
// COMPARISON MAPS BELOW
// This is where the notification will be displayed also

// Pin Set Row
// (always have to map through the inputs)
pin_set.forEach((input_1) => {
  // Record Keys for first pin field comparison
  input_1.addEventListener("keyup", () => {
    // For the values entered in pin set row
    if (input_1.value) {
      // Test print
      console.log("pin set row: compare");
      // Map through the inputs for pin set row
      const pin_set_compare = [...pin_set]
        .map((compare_pin_set) => compare_pin_set.value)
        .join("");
      // Print digits to console
      console.log(`The First Pin #: ${pin_set_compare}`);
    }
  });
});

// Pin Confirm Row
// (always have to map through the inputs)
// (and provide a key for the comparison after all inputs are filled)
pin_confirm.forEach((input_2, key_2) => {
  // Record Keys for confirm pin field comparison
  input_2.addEventListener("keyup", () => {
    // For the values entered in pin confirm row
    if (input_2.value) {
      // You need all 4 inputs to compare
      if (key_2 === 3) {
        // Test print
        console.log("pin confirm row: compare");
        // Map through the inputs for pin confirm row
        const pin_confirm_compare = [...pin_confirm]
          .map((compare_pin_confirm) => compare_pin_confirm.value)
          .join("");
        // Print digits to console
        console.log(`The Confirm Pin #: ${pin_confirm_compare}`);
        // Compare the values (for the match)
        // first get the values from the pin set row
        pin_set.forEach((input_1) => {
          if (input_1.value) {
            // Map through the inputs for pin set row
            const pin_set_compare = [...pin_set]
              .map((compare_pin_set) => compare_pin_set.value)
              .join("");
            // Print digits to console
            console.log(`The First Pin #: ${pin_set_compare}`);
            // Compare the values
            if (pin_set_compare === pin_confirm_compare) {
              /////////////////////////////////////////////
              /////////////////////////////////////////////
              // FOR MATCHING PIN FIELDS
              /////////////////////////////////////////////
              console.log("Match");

              // Change the color of the pin inputs to green
              // darker green for light mode
              // check if the dark mode is active
              // then write a ternery operator to set the color accordingly
              pin_set.forEach((input_1) => {
                const isDarkMode =
                  document.body.classList.contains("dark-mode");
                // Set color based on theme
                input_1.style.color = isDarkMode ? "#00FF00" : "#16BC00"; // Darker Green for light mode
                // Green for dark mode
                // input_1.style.color = "#00FF00";
                input_1.style.transition = "color 0.5s ease-in-out";
              });
              pin_confirm.forEach((input_2) => {
                const isDarkMode =
                  document.body.classList.contains("dark-mode");
                // Set color based on theme
                input_2.style.color = isDarkMode ? "#00FF00" : "#16BC00"; // Darker Green for light mode
                // input_2.style.color = "#00FF00";
                input_2.style.transition = "color 0.5s ease-in-out";
              });

              // Replace the clear pins button with new HTML
              const reset_button = document.getElementById("reset_button");
              reset_button.innerHTML = `Pins Match`;
              // Set the color based on theme
              const isDarkMode = document.body.classList.contains("dark-mode");
              reset_button.style.color = isDarkMode ? "#00FF00" : "#16BC00"; // Darker Green for light mode
              // reset_button.style.color = "#00FF00";

              // Time it to clear pins and reset the button
              setTimeout(() => {
                reset_button.innerHTML = `Clear Pin fields`;
                // Check if dark mode is active
                // const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                // Or alternatively check for a dark mode class on your document if you implement your own toggle
                const isDarkMode =
                  document.body.classList.contains("dark-mode");

                // Set color based on theme
                reset_button.style.color = isDarkMode ? "#ffffff" : "#000000";
                reset_button.style.transition = "color 0.5s ease-in-out";
                reset_button.style.opacity = "50%";

                // Focus on the first input
                pin_set[0].focus();
              }, 3000);

              //////////////////////////////////////////////
              //Changes so far but not if you switch mid entering (bug)

              // Enable the Submit Button
              submit_pins.disabled = false;
            } else {
              // If the values don't match
              console.log("No Match");
              // Change the color of the pin inputs to red
              pin_set.forEach((input_1) => {
                // input_1.style.backgroundColor = "red";
                input_1.style.color = "#FF0000";
                input_1.style.transition = "color 0.5s ease-in-out";
              });
              pin_confirm.forEach((input_2) => {
                // input_2.style.backgroundColor = "red";
                input_2.style.color = "#FF0000";
                input_1.style.transition = "color 0.5s ease-in-out";
              });

              // Replace the clear pins button with new HTML
              const reset_button = document.getElementById("reset_button");
              reset_button.innerHTML = `Pins Dont Match`;
              reset_button.style.color = "#FF0000";

              // Time it to clear pins and reset the button
              setTimeout(() => {
                reset_button.innerHTML = `Clear Pin fields`;
                reset_button.style.color = "#ffffff";
                reset_button.style.transition = "color 0.5s ease-in-out";
                reset_button.style.opacity = "50%";

                // NOW REMOVE THE PIN FIELDS
                pin_set.forEach((input_1) => {
                  input_1.value = "";
                });
                pin_confirm.forEach((input_2) => {
                  input_2.value = "";
                });

                // change the color of the pin inputs to white
                pin_set.forEach((input_1) => {
                  // input_1.style.backgroundColor = "white";
                  input_1.style.color = "#ffffff";
                  input_1.style.transition = "color 0.5s ease-in-out";
                });
                pin_confirm.forEach((input_2) => {
                  // input_2.style.backgroundColor = "white";
                  input_2.style.color = "#ffffff";
                  input_1.style.transition = "color 0.5s ease-in-out";
                });

                // Focus on the first input
                pin_set[0].focus();
              }, 2000);

              ///////////////////////////////////////////
              ///////////////////////////////////////////
              ////////////MATCH NOTIFICATION/////////////
              ///////////////////////////////////////////
              // Remove the Match Notification

              // match_notify.classList.remove('entered');

              // Display the No Match Notification

              // no_match_notify.classList.add('entered');

              // Disable the Submit Button
              submit_pins.disabled = true;
            }
          }
        });
      }
    }
  });
});

// PIN BACKSPACE FUNCTIONALITY

// Pin Set Row
pin_set.forEach((input, index) => {
  // Add keydown event listener to each input
  input.addEventListener("keydown", (e) => {
    // Check if backspace key is pressed
    if (e.key === "Backspace") {
      // If the input is empty AND we're not on the first input, move to previous input
      if (input.value === "" && index !== 0) {
        // Prevent default backspace behavior
        e.preventDefault();
        // Focus previous input
        pin_set[index - 1].focus();
        // Clear the previous input's value
        pin_set[index - 1].value = "";
      }

      // If the input has a value, just let the backspace clear it normally
      // No need to change focus in this case
    }
  });
});

// // Pin Confirm Row
pin_confirm.forEach((input, index) => {
  // Add keydown event listener to each input
  input.addEventListener("keydown", (e) => {
    // Check if backspace key is pressed
    if (e.key === "Backspace") {
      // If the input is empty AND we're not on the first input, move to previous input
      if (input.value === "" && index > 0) {
        // Prevent default backspace behavior
        e.preventDefault();
        // Focus previous input
        pin_confirm[index - 1].focus();
        // Clear the previous input's value
        pin_confirm[index - 1].value = "";
      }

      // If the input has a value, just let the backspace clear it normally
      // No need to change focus in this case
    }
  });
});

// CLEAR BUTTON FUNCTIONALITY
////////////////////////////////////////////////////
////////////////////////////////////////////////////
// Call this function in the Clear button
const reset = () => {
  // Reset the form
  form.reset();
  // Reset the pin input colors
  pin_set.forEach((input_1) => {
    input_1.style.color = "#ffffff"; // Reset to white color
    input_1.style.transition = "color 0.5s ease-in-out";
  });
  pin_confirm.forEach((input_2) => {
    input_2.style.color = "#ffffff"; // Reset to white color
    input_2.style.transition = "color 0.5s ease-in-out";
  });
  // Delete the Match Notify
  // match_notify.classList.remove('entered');
  no_match_notify.style.display = "none";
  // Delete the No Match
  // no_match_notify.classList.remove('entered');
  match_notify.style.display = "none";
  // Disable the Submit Button
  submit_pins.disabled = true;
};

// Add event listener to the reset button
reset_pins.addEventListener("click", (e) => {
  // so submit doesn't refresh the page
  e.preventDefault();
  // Test print button function
  console.log("Reset Button Pressed");
  // Call the reset function
  reset();
});

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
// Event Listener for Submit Button
submit_pins.addEventListener("click", (e) => {
  e.preventDefault();

  console.log("Submit Button Pressed");

  const pinConfirmValue = [...pin_confirm]
    .map((pinInput) => pinInput.value)
    .join("");

  const pendingRegistration = JSON.parse(
    sessionStorage.getItem("pendingRegistration"),
  );

  if (!pendingRegistration) {
    console.error("No pending registration was found.");
    return;
  }

  pendingRegistration.pin = pinConfirmValue;

  sessionStorage.setItem(
    "pendingRegistration",
    JSON.stringify(pendingRegistration),
  );

  // Continue without placing the name or PIN in the URL
  window.location.href = "acct_type.html";
});

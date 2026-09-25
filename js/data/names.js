// REGISTER THE USER

// Query the names form
const names_form = document.getElementById("names_form");

// Query the submit button
const submit_names = document.getElementById("submit_login");

// Query the names notify
const names_alert = document.getElementById("name_notify");

// Query the first name
const firstname = document.getElementById("firstname");

// Query the last name
const lastname = document.getElementById("lastname");

// Add event listener to the last name input to check if the first and last names are filled
// Then enable SUBMIT BUTTON (by typing, pasting or speech)
lastname.addEventListener("input", (e) => {
  e.preventDefault();
  if (firstname.value && lastname.value) {
    console.log("Both inputs are filled");
    submit_names.disabled = false;
  } else {
    submit_names.disabled = true;
  }
});

// Add event listener to submit button to register the user
// WHOLE NAME FORM
names_form.addEventListener("submit", (e) => {
  // so submit doesn't refresh the page
  e.preventDefault();

  // Test print button function
  console.log("Submit Button Pressed");

  // Query the firstname
  const firstname = document.getElementById("firstname");

  // Query the lastname
  const lastname = document.getElementById("lastname");

  // Capitalize first letter BEFORE validation
  if (firstname.value.trim() !== "") {
    firstname.value =
      firstname.value.charAt(0).toUpperCase() +
      firstname.value.slice(1).toLowerCase();
  }

  if (lastname.value.trim() !== "") {
    lastname.value =
      lastname.value.charAt(0).toUpperCase() +
      lastname.value.slice(1).toLowerCase();
  }

  // The Letters Only for the first name and last name
  // Regular expression to allow only letters (A-Z, a-z)
  // and spaces (for names with spaces)
  const lettersOnly = /^[A-Za-z]+$/;
  // Check if the first name is empty or contains invalid characters
  if (firstname.value.trim() === "" || !lettersOnly.test(firstname.value)) {
    // Show error message
    names_alert.innerHTML = "Please enter a valid first name (letters only).";
    names_alert.style.color = "red";
    names_alert.style.fontSize = "small";

    // timeout to remove the error message after 3 seconds
    setTimeout(() => {
      // Remove the error message after 3 seconds
      names_alert.innerHTML = "";
      // Remove the text field firstname
      firstname.value = "";
      // Remove the text field lastname
      lastname.value = "";
    }, 3000);
    // Set the focus back to the first name input
    firstname.focus();
    return;
  }

  // Check if the last name is empty or contains invalid characters
  if (lastname.value.trim() === "" || !lettersOnly.test(lastname.value)) {
    // Show error message
    names_alert.innerHTML = "Please enter a valid last name (letters only).";
    names_alert.style.color = "red";
    names_alert.style.fontSize = "small";

    // Capitalize the first letter of the first name
    lastname.value =
      lastname.value.charAt(0).toUpperCase() + lastname.value.slice(1);

    // timeout to remove the error message after 3 seconds
    setTimeout(() => {
      // Remove the error message after 3 seconds
      names_alert.innerHTML = "";
      // Remove the text field firstname
      firstname.value = "";
      // Remove the text field lastname
      lastname.value = "";
    }, 3000);
    // Set the focus back to the first name input
    firstname.focus();
    return;
  }

  //Retrieve user first name text, store it in variable
  let first = firstname.value;
  // Test print for now
  console.log(first);

  // Retrieve user last name text, store it in variable
  let last = lastname.value;
  // Test print for now
  console.log(last);

  // Store the registration data temporarily for the next page
  const pendingRegistration = {
    firstName: first.trim(),
    lastName: last.trim(),
  };

  sessionStorage.setItem(
    "pendingRegistration",
    JSON.stringify(pendingRegistration),
  );

  // Continue without placing personal information in the URL
  window.location.href = "pin_number.html";
});

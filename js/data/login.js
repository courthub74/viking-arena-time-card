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

// When page loads 
document.addEventListener('DOMContentLoaded', function() {

    // Get the ELEMENTS from the login page

    // Login button
    const loginButton = document.getElementById('submit_login');

    // Pin inputs
    const pinField = document.querySelectorAll('.pin_put');

    // Name Dropdown
    const usersDropdown = document.getElementById('users_dropdown');

    // Clear button
    const clearPinsButton = document.getElementById('reset_button');

    // Forgot Pin button
    const forgotPinButton = document.getElementById('forgot_button');

    // Test Print ELEMENTS
    console.log(loginButton);
    console.log(pinField);
    console.log(usersDropdown);
    console.log(clearPinsButton);
    console.log(forgotPinButton);

    // Call the load users function 
    loadUsers();

    // Function to load users from local storage into the dropdown
    function loadUsers() {
        // Get the users from local storage (expecting a JSON string)
        const users = JSON.parse(localStorage.getItem('users')) || [];
        // Test Print
        console.log(users);
        // Populate the dropdown with usernames

        // Clear the dropdown first
        usersDropdown.innerHTML = '';

        // Add a default option to the dropdown
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        // defaultOption.textContent = 'Select a user';
        defaultOption.selected = true;
        defaultOption.disabled = true;
        usersDropdown.appendChild(defaultOption);

        // Loop through the users and add them to the dropdown
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username; // Set the value to the username
            option.textContent = user.username; // Display the username in the dropdown
            // Remove the %20 from the username (by decoding it)
            option.textContent = decodeURIComponent(user.username);
            usersDropdown.appendChild(option);
        });

        // NOW make the focus on the pin field

        // add event listener to the dropdown
        usersDropdown.addEventListener('change', (e) => {
            // Get the selected username
            const selectedUsername = e.target.value;
            // Test Print
            console.log(`Selected username: ${selectedUsername}`);
            if (pinField && pinField.length > 0) {
                // Delay the focus slightly for mobile compatibility
                setTimeout(() => {
                    pinField[0].focus();
                    
                    // For iOS Safari, try this trick to ensure focus remains
                    // This makes the field visually respond to the focus action
                    pinField[0].setAttribute('readonly', 'readonly');
                    setTimeout(() => {
                        pinField[0].removeAttribute('readonly');
                    }, 10);
                }, 100);
            }
        });

        // NOW the numeric input behavior for the pin number
        // For every input in login_pins 
        pinField.forEach((input, index) => {
            // Add input type="number" or pattern attribute to HTML elements
            input.setAttribute('inputmode', 'numeric'); // Set input mode to numeric
            // Prevent non-numeric input with preventDefault
            input.addEventListener('keypress', (e) => {
                // Allow only digits (0-9)
                if (!/\d/.test(e.key)) {
                    e.preventDefault(); // Prevent non-numeric input
                }
            });
            // Clean any non-numeric characters from the input value
            input.addEventListener('input', () => {
                // Remove any non-numeric characters from the input value
                input.value = input.value.replace(/\D/g, '');
            });

            // BACKSPACE KEY HANDLER
            // Add event listener for backspace key
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
                    // Move focus to the previous input field if the current one is empty and backspace is pressed
                    pinField[index - 1].focus();
                    // Clear the input value
                    input.value = '';
                }
            });
        });

        // Move focus to the next input field when a digit is entered
        pinField.forEach((input, key) => {
            input.addEventListener('keyup', (e) => {
                // Move focus to the next input field if a digit is entered
                // If input contains a value,
                if (input.value) {
                    // Move to next input if there is a next input
                    if (key < pinField.length - 1) {
                        pinField[key + 1].focus();
                    }
                    // If the last input is filled, move focus to the submit button
                    if (key === pinField.length - 1) {
                        loginButton.focus();
                    }
                    // Test Print pin fields filled
                    console.log("Pin field filled");
                    // If there is all 4 digits entered
                    if (key === 3) {
                        // Let's read the pins for matching to the LocalStorage
                        const pin_login_value = [...pinField].map(each_pinField => each_pinField.value).join('');
                        // Print the value of the pin field
                        console.log(`Pin value: ${pin_login_value}`);
                        // Check if the pin is correct
                        const users = JSON.parse(localStorage.getItem('users')) || [];
                        // find the user name selected in the user dropdown
                        const selectedUser = users.find(user => user.username === usersDropdown.value);
                        console.log(`Selected user: ${selectedUser}`);
                        // Check if the selected user exists
                        console.log(`Selected user pin: ${selectedUser.pin}`);
                        if (selectedUser && selectedUser.pin === pin_login_value) {
                            // Pin is correct, enable the login button
                            loginButton.disabled = false;
                            // Change the pin field color to green
                            pinField.forEach(pin => {
                                const isDarkMode = document.body.classList.contains('dark-mode');
                                // Set the color based on the mode
                                pin.style.color = isDarkMode ? "#00FF00" : "#16BC00";
                                pin.style.transition = "color 0.5s ease-in-out";
                            });

                            //////////////// IF THE PINS ARE CORRECT///////////////////////
                            // Replace the clear pins button with new HTML
                            // and make the forgot pin button invisible
                            const forgotPinButton = document.getElementById('forgot_button');
                            // set opacity to 0% to make it invisible
                            forgotPinButton.style.opacity = "0%";
                            const reset_button = document.getElementById('reset_button');
                            reset_button.innerHTML = `Pin is Correct`;
                            // Set the color based on theme
                            const isDarkMode = document.body.classList.contains('dark-mode');
                            reset_button.style.color = isDarkMode ? "#00FF00" : "#16BC00"; // Darker Green for light mode
                            // reset_button.style.color = "#00FF00";

                            // Time it to clear pins and reset the button
                            setTimeout(() => {
                                reset_button.innerHTML = `Clear Pin fields`;
                                // Check if dark mode is active
                                // const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                                // Or alternatively check for a dark mode class on your document if you implement your own toggle
                                const isDarkMode = document.body.classList.contains('dark-mode');
                                
                                // Set color based on theme
                                reset_button.style.color = isDarkMode ? "#ffffff" : "#000000";
                                reset_button.style.transition = "color 0.5s ease-in-out";
                                // Set opacity based on theme
                                reset_button.style.opacity = isDarkMode ? "50%" : "70%";

                                // Make the forgot pin button reappear
                                forgotPinButton.style.opacity = "100%";

                                // Focus on the first input
                                pin_set[0].focus();
                            }
                            , 2000); // 2 seconds delay
                        
                            

                            
                            // Add event listener to the login button
                            loginButton.addEventListener('click', (e) => {
                                // Prevent the default action of the submit button
                                e.preventDefault();
                                // Test Print
                                console.log("Login Submitted");
                                // Get the username and pin from the input fields
                                const username = usersDropdown.value;
                                const pin = pin_login_value;
                                // Encode the username and pin
                                const encodedUsername = encodeURIComponent(username);
                                const encodedPin = encodeURIComponent(pin);

                                // assign a session id to the user
                                // Create a session object with the username and pin
                                const session = {
                                    // Generate a unique session ID (could be a random number or a timestamp)
                                    sessionId: Math.floor(Math.random() * 1000000), // Random session ID
                                    sessionDate: Date.now(), // Use current timestamp as session ID
                                    username: selectedUser.username,
                                    pin: pin_login_value,
                                    accountType: selectedUser.accountType // Add account type to the session object
                                };
                                // Store the session object in session storage
                                sessionStorage.setItem('session', JSON.stringify(session));
                                // Test Print session object
                                console.log(`Session object: ${JSON.stringify(session)}`);
                                
                                // Redirect to the appropriate page based on account type
                                if (selectedUser.accountType === 'Manager') {
                                    window.location.href =
                                    `./html/dashboards/manager.html?username=${encodedUsername}&acct_type=${encodeURIComponent(selectedUser.accountType)}`;
                                } else {
                                    window.location.href =
                                    `./html/dashboards/employee.html?username=${encodedUsername}&acct_type=${encodeURIComponent(selectedUser.accountType)}`;
                                }
                             
                            });
                        } else {
                            //////////////// IF THE PINS ARE INCORRECT///////////////////////
                            // set opacity to 0% to make it invisible
                            forgotPinButton.style.opacity = "0%";
                            const reset_button = document.getElementById('reset_button');
                            reset_button.innerHTML = `Pin is Incorrect`;
                            // Set the color based on theme
                            const isDarkMode = document.body.classList.contains('dark-mode');
                            reset_button.style.color = isDarkMode ? "#BC0000" : "#BC0000"; // Darker Red for light mode
                            // Keep opacity full since you've set a filter on css selector
                            reset_button.style.opacity = "100%"
                            // Time it to clear pins and reset the button
                            // Bring the original page back
                            setTimeout(() => {
                                reset_button.innerHTML = `Clear Pin fields`;
                                // Check if dark mode is active
                                // const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                                // Or alternatively check for a dark mode class on your document if you implement your own toggle
                                const isDarkMode = document.body.classList.contains('dark-mode');
                                
                                // Change color back based on theme
                                reset_button.style.color = isDarkMode ? "#ffffff" : "#000000";
                                reset_button.style.transition = "color 0.5s ease-in-out";
                                // Reset opacity based on theme
                                reset_button.style.opacity = isDarkMode ? "55%" : "70%";
                                // reset_button.style.opacity = "60%"
                                

                                // Make the forgot pin button reappear
                                forgotPinButton.style.opacity = "100%";

                                // Reset the pin fields
                                pinField.forEach(pin => {
                                    pin.value = '';
                                    pin.style.color = ''; // Reset the color to default
                                });

                                // Focus on the first input
                                pinField[0].focus();
                            }
                            , 2000); // 2 seconds delay
                            // Pin is incorrect, disable the login button
                            loginButton.disabled = true;
                            // // Change the pin field color to red
                            pinField.forEach(pin => {
                                pin.style.color = 'red';
                            });
                            // Jump to the next input field
                            pinField[key + 1].focus();
                        }
                    }
                }
            });
        });
    };

    // Clear button functionality
    clearPinsButton.addEventListener('click', () => {
        // Clear the pin fields
        pinField.forEach(pin => {
            pin.value = '';
            pin.style.color = ''; // Reset the color to default
        });
        // Disable the login button
        loginButton.disabled = true;
        // Focus on the first pin field
        pinField[0].focus();
    });
    
    // Forgot pin button functionality
    forgotPinButton.addEventListener('click', () => {
        // Redirect to the forgot pin page
        // Here it will request the user to enter their phone number to send a pin to reset the pin
        window.location.href = '../../html/forgot_pin.html';
    });

    // If the user has correctly entered the pin number, change the text and text color of the clear button
    clearPinsButton.addEventListener('click', () => {});
});




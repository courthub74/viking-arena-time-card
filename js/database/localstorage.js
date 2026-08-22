// Register users in local storage
// This is a simple implementation for a database
// We also retrieve the user data from the local storage
// We connect to the registration page and save the user data

// ALGORITHM FOR GETTING DATA FROM LOCAL STORAGE DATABASE

// Need to determine if the user is logged in or not
// If logged in, show the profile name and account type
// If not logged in, show "Not Logged In" and "N/A"

// Receiving page

// localStorage.getItem('the_item') || 'You Don't have the item'

function registerUser(username, accountType, pin) { 
    // Get the users from the local storage or initialize an empty array
    var users = JSON.parse(localStorage.getItem('users')) || [];

    // Create new user object
    const newUser = {
        // id: Date.now(), // Simple unique id
        id: generateUserId(),
        username: username,
        accountType: accountType,
        pin: pin,
        createdAt: new Date().toISOString()
    };

    // Add the new user to the users array
    users.push(newUser);

    // Save back to localStorage as 'users' key
    localStorage.setItem('users', JSON.stringify(users));

    // Return newUser object
    return { success: true, message: 'User registered Successfully', userId: newUser.id};

    // Helper function to generate a simple unique ID
    function generateUserId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

 // LOGIN function
 function loginUser(username, pin) {
    // Get item from local storage
    var users = JSON.parse(localStorage.getItem('users')) || [];

    // Find user by name
    const user = users.find( u => u.username === username);

    // Test print finding the user name
    console.log(`The user found is: ${user}`);

    // if(!user) {
    //     return { success: false, message: 'User not found'};
    // }

    // // Verify PIN
    // if (user.pin !== pin) {
    //     return { success: false, message: 'Invalid PIN'};
    // }

    // Store current user info in session
    sessionStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        username: user.username,
        accountType: user.accountType,
        loginTime: new Date().toISOString()
    }));

    // Test print the current user
    var currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    console.log(`The current user is: ${currentUser.username}`);

    // Redirect to the dashboard page based on account type
    if (user.accountType === 'Manager') {
        // Redirect to the manager page
        const repoName = "/viking_arena_time_card"
        // this will need to be changed for PostgreSQL implementation to redirect to the manager dashboard page
        // window.location.href = `${repoName}/html/dashboards/manager.html?username=${username}&acct_type=${user.accountType}`;
        window.location.href = `../../html/dashboards/manager.html?username=${username}&acct_type=${user.accountType}`;
    } else {
        // Redirect to the customer page
        const repoName = "/viking_arena_time_card"
        // this will need to be changed for PostgreSQL implementation to redirect to the employee dashboard page
        // window.location.href = `${repoName}/html/dashboards/employee.html?username=${username}&acct_type=${user.accountType}`;
        window.location.href = `../../html/dashboards/employee.html?username=${username}&acct_type=${user.accountType}`;
    }
    // If ABOVE doesn't work, try this:
    // window.location.href = `../../html/dashboards/employee.html?username=${username}&acct_type=${user.accountType}`;

    return {
        success: true,
        message: 'Login successful',
        user: {
            username: user.username,
            accountType: user.accountType,
        }
        
    };
}


// Submit the Name to REGISTRATION
// Get the info from the confirmation page
// Save the user data to the local storage
function submitRegistration() {
    // Get the username account type and pin from the confirmation page
    var username = document.getElementById('confirmed_name').innerHTML;
    // If ABOVE doesn't work, try this:
    // var username = document.getElementById('confirmed_name').textContent;
    var accountType = document.getElementById('confirmed_acct_type').innerHTML;
    var pin = document.getElementById('confirmed_pin').innerHTML;

    console.log(`User ${username} is in the database as a ${accountType}.  Their pin# is: ${pin}`);

    // Encode the username and pin and account type
    username = encodeURIComponent(username);
    accountType = encodeURIComponent(accountType);
    pin = encodeURIComponent(pin);

    // Conditionals for the account type

    // Original relocation should work you refactored it to use the repoName variable for the path to the dashboard pages on github pages.  
    // Since we are going to implement PostgresSQL we can restructure this to relocate without the variable repoName for now.
    if (accountType === 'Manager') {
        // Redirect to the manager page
        // Try this:
        // const repoName = "/viking_arena_time_card"
        // window.location.href = `${repoName}/html/dashboards/manager.html?username=${username}&acct_type=${accountType}&encodedPinConfirm=${pin}`;
        window.location.href = `../../html/dashboards/manager.html?username=${username}&acct_type=${accountType}&encodedPinConfirm=${pin}`;
    } else {
        // Redirect to the customer page
        // const repoName = "/viking_arena_time_card"
        // window.location.href = `${repoName}/html/dashboards/employee.html?username=${username}&acct_type=${accountType}&encodedPinConfirm=${pin}`;
        window.location.href = `../../html/dashboards/employee.html?username=${username}&acct_type=${accountType}&encodedPinConfirm=${pin}`;
    }

    // Set user in session storage as currentUser
    sessionStorage.setItem('currentUser', JSON.stringify({
        username: username,
        accountType: accountType,
        pin: pin
    }));
    
    return registerUser(username, accountType, pin);
}


// Call the submitRegistration function upon submit button click

// Wait for the page to load
document.addEventListener('DOMContentLoaded', function() {

    // Query the same submit button from the confirmation page
    const submitButton = document.getElementById('confirmation_advance');

    console.log(`The Submit Button test: ${submitButton}`);
    // Add an event listener to the submit button
    submitButton.addEventListener('click', (e) => {
        // Test Print
        console.log("Registration Submitted");
        // Prevent the default action of the submit button
        e.preventDefault();

        // Register the User
        // by calling the submitRegistration function
        submitRegistration();

        // Login the User
        // by calling the loginUser function
        loginUser(username, pin);

        // Test Print the current user
        // First get the current user from the session storage
        var currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

        // Then print the current user
        console.log(`The current user is: ${currentUser.username}`);
    });
});








// Test Print the current user
// First get the current user from the session storage
// var currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

// Then print the current user
// console.log(`The current user is: ${currentUser.username}`);

// Retrieve the current user from session storage
var currentUser = sessionStorage.getItem('currentUser') || sessionStorage.getItem('session');
// Parse the current user from JSON string to object
var currentUser = JSON.parse(currentUser);
// Test print the current user
console.log(`The current user is: ${currentUser.username} and their role is: ${currentUser.accountType} session: ${currentUser.sessionId} from (logout.js)`);
// Check if the current user is null or undefined
if (currentUser === null || currentUser === undefined) {
    // If the user is not logged in, redirect to the login page
    window.location.href = '../../index.html';
    window.location.href = '/viking_arena_time_card/index.html';
}

// Display the current user's name in the header
const userNameHeader = document.getElementById('user_name_header');


// Query the logout button from the dashboard page
const logoutManager = document.getElementById('logout_manager');

// Log out function
function logoutUser() {
    // Test print the current user
    console.log(`Logging out user: ${currentUser.username} and their role is: ${currentUser.accountType} session: ${currentUser.sessionId} from (logout.js)`);
    // Delete the session storage item
    sessionStorage.removeItem('currentUser');

    // Also if the user is logged in as a session 
    sessionStorage.removeItem('session');

    // Redirect to login page
    window.location.href = '../../index.html';
    
    // Test Redirect to google.com for testing purposes
    // window.location.href = 'https://www.google.com';
}



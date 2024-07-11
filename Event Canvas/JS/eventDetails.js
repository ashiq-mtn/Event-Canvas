// Function to format the date in the desired format
import { app, database, auth } from './firebase.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

function formatDate(startDate, endDate, lastDate) {
    const startOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const endOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const lastOptions = { year: 'numeric', month: 'long', day: 'numeric' };

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const lastDateObj = new Date(lastDate);

    const formattedStartDate = startDateObj.toLocaleDateString('en-US', startOptions);
    const formattedEndDate = endDateObj.toLocaleDateString('en-US', endOptions);
    const formattedLastDate = lastDateObj.toLocaleDateString('en-US', lastOptions);

    if (startDate === endDate) {
        // If startDate and endDate are the same, only display startDate
        return {
            startDate: formattedStartDate,
            endDate: formattedStartDate,
            lastDate: formattedLastDate
        };
    } else {
        // If startDate and endDate are different, display both
        return {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            lastDate: formattedLastDate
        };
    }
}

// Function to format the time in the desired format
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hoursInt = parseInt(hours, 10);
    const minutesInt = parseInt(minutes, 10);
    let formattedTime = '';
    if (hoursInt === 12) {
        formattedTime = `12:${minutesInt < 10 ? '0' + minutesInt : minutesInt} PM`;
    } else if (hoursInt > 12) {
        formattedTime = `${hoursInt - 12}:${minutesInt < 10 ? '0' + minutesInt : minutesInt} PM`;
    } else {
        formattedTime = `${hoursInt === 0 ? '12' : hoursInt}:${minutesInt < 10 ? '0' + minutesInt : minutesInt} AM`;
    }
    return formattedTime;
}

// Function to parse the query string and retrieve event data
function getEventDataFromQueryString() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const eventData = {};
    for (const [key, value] of urlParams.entries()) {
        eventData[key] = value;
    }
    return eventData;
}

function displayEventDetails(eventData) {
    const eventDetailsDiv = document.getElementById('eventContainer');
    const floatingDiv = document.getElementById('floatingDiv');
    const formattedStartDate = formatDate(eventData.startDate, eventData.endDate, eventData.eventLastDate).startDate;
    const formattedEndDate = formatDate(eventData.startDate, eventData.endDate, eventData.eventLastDate).endDate;
    const formattedLastDate = formatDate(eventData.startDate, eventData.endDate, eventData.eventLastDate).lastDate;
    // Preserve line breaks and whitespace in detailed description
    // const detailedDescriptionWithLineBreaks = eventData.detailedDescription.replace(/\n/g, '<br>');
    let html = `
    <div class="event-details">
        <h1>${eventData.title}</h1>
        <!-- Update the HTML structure to include a fixed-size block for the image -->
        <div class="image-block">
            <img src="${eventData.thumbnailURL}" alt="Event Thumbnail">
        </div>
        <h4>About the Event:</h4>
        <p>${eventData.detailedDescription}</p>
        <h4>Event Details:</h4>
        <ul>
            <li>Date: ${formattedStartDate} - ${formattedEndDate}</li>
            <li>Time: ${formatTime(eventData.startTime)} to ${formatTime(eventData.endTime)}</li>
            <li>Venue: ${eventData.location}</li>
        </ul>`;

    if (eventData.eventDept) {
        html += `
            <p><strong>Event Departments:</strong></p>
            <div class="department-boxes">
                ${eventData.eventDept.split(',').map(department => `
                    <div class="department-box">${department.trim()}</div>
                `).join('')}
            </div>`;
    }

    html += `
        <h4>Registration Details:</h4>
        <ul>
            <li>Registration Fee : &#x20B9; ${eventData.fee}</li>
            <li>Last Date for Registration : ${formattedLastDate}</li>
            <li>Official Website : <a href="${eventData.websiteLink}" target="_blank">Official Event Website</a></li>
        </ul>
        <h4>Contact Details:</h4>
        <ul>
            <li> ${eventData.orgName1} | +91 ${eventData.orgPhone1}</li>`;
    // Check if orgName2 and orgPhone2 are not null before adding them to the HTML
    if (eventData.orgName2 && eventData.orgPhone2) {
        html += `<li> ${eventData.orgName2} | +91 ${eventData.orgPhone2}</li>`;
    }
    html += `</ul>
                </div>
            `;
    eventDetailsDiv.innerHTML = html;
    floatingDiv.innerHTML = `
        <h3>Event Details</h3>
        <div class="info-field">
            <div class="icons">
            <i class="fa-solid fa-calendar-days"></i>
            <i class="fa-solid fa-clock"></i>
            <i class="fa-solid fa-location-dot"></i>
            </div>

            <div class="detailedText">
                <p>${formattedStartDate} - ${formattedEndDate}</p>
                <p>${formatTime(eventData.startTime)} - ${formatTime(eventData.endTime)} </p>
                <p>${eventData.location}</p>
            </div>
        </div>
        
        <button id="regBtn">Register</button>
    `;
    displayRegButton(eventData.eventLastDate);

}
function displayRegButton(eventLastDate) {
    const currentDate = new Date(); // Get current date
    const lastDate = new Date(eventLastDate); // Convert event last date to Date object

    // Set both dates to the start of the day to compare dates only
    currentDate.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    const regBtn = document.getElementById('regBtn');
    
    // Compare dates
    if (currentDate > lastDate) {
        regBtn.disabled = true;
        regBtn.textContent = 'Registration expired';
    }
}


// Function to fetch registered events and check for event title match
function checkIfEventRegistered(userId, eventTitle, callback) {

    const registeredEventsRef = ref(database, `registeredEvents/${userId}`);
    onValue(registeredEventsRef, (snapshot) => {
        const events = snapshot.val();
        if (events) {
            let isRegistered = false;
            Object.keys(events).forEach((eventId) => {
                const event = events[eventId];
                if (event.eventTitle === eventTitle) {
                    isRegistered = true;
                }
            });
            callback(isRegistered);
        } else {
            callback(false);
        }
    }, (error) => {
        console.error('Error fetching registered events:', error);
        callback(false);
    });
}

// Function to check if the user is logged in and their role
function checkLoggedIn() {
    const user = auth.currentUser;
    // const eventData = getEventDataFromQueryString();
    if (!user) {
        // User is not logged in, redirect to the login page
        window.location.href = '/Login/login.html';
    } else {
        // Retrieve user data from Firebase
        const userRef = ref(database, 'users/' + user.uid);

        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                // Access the user's role
                const role = userData.role;
                if (role === 'college' || role === 'company') {
                    // If the user is a student, display an alert
                    alert('Only students can register for events.');
                } else {
                    const eventData = getEventDataFromQueryString();
                    checkIfEventRegistered(user.uid, eventData.title, (isRegistered) => {
                        if (isRegistered) {
                            regBtn.disabled = true;
                            regBtn.textContent = 'You have already registered';
                        } else {
                            // Construct the URL with event data as query parameters
                            const eventDetailsQueryString = new URLSearchParams(eventData).toString();
                            window.location.href = `/payment.html?${eventDetailsQueryString}`;
                        }
                    });
                }
            } else {
                console.log("User data not found");
            }
        }, (error) => {
            console.error("Error fetching user data:", error);
        });
    }
}


// Retrieve event data from query string and display it
const eventData = getEventDataFromQueryString();

console.log(eventData);
displayEventDetails(eventData);

// Add event listener to the Register button
document.getElementById('regBtn').addEventListener('click', () => {
    // Check if the user is logged in
    checkLoggedIn();
});



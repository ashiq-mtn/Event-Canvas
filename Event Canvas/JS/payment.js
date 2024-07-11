import { app, database, auth } from './firebase.js';
import { ref, push } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

// Function to retrieve event data from query string
function getEventDataFromQueryString() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const eventData = {};
    for (const [key, value] of urlParams.entries()) {
        eventData[key] = value;
    }
    return eventData;
}

// Function to format the date in the desired format
function formatDate(startDate, endDate) {
    const startOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const endOptions = { year: 'numeric', month: 'long', day: 'numeric' };

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    const formattedStartDate = startDateObj.toLocaleDateString('en-US', startOptions);
    const formattedEndDate = endDateObj.toLocaleDateString('en-US', endOptions);

    if (startDate === endDate) {
        return formattedStartDate;
    } else {
        return `${formattedStartDate} - ${formattedEndDate}`;
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

document.addEventListener('DOMContentLoaded', () => {
    const eventData = getEventDataFromQueryString();
    console.log(eventData);

    if (eventData.title) {
        const formattedDate = formatDate(eventData.startDate, eventData.endDate);
        document.getElementById('eventTitle').innerText = eventData.title;
        document.getElementById('eventDate').innerText = formattedDate;
        document.getElementById('eventTime').innerText = formatTime(eventData.startTime) + ' - ' + formatTime(eventData.endTime);
        document.getElementById('eventFee').innerHTML = `&#x20B9; ${eventData.fee}`;

        // Set the event thumbnail if available
        const eventThumbnail = document.getElementById('eventThumbnail');
        if (eventThumbnail) {
            eventThumbnail.src = eventData.thumbnailURL;
            eventThumbnail.alt = `${eventData.title} Thumbnail`;
        }
    } else {
        console.error("No event data found in query string");
    }
});

// Event listener for form submission
document.getElementById('buyNowbtn').addEventListener("click", async (e) => {
    e.preventDefault();

    const eventData = getEventDataFromQueryString(); // Get original event data
    const eventId = eventData.eventId; // Extract eventId from eventData

    // If form is valid, proceed with data handling
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const email = document.getElementById('email').value;
    const college = document.getElementById('college').value;
    const phone = document.getElementById('phone').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

    // Register event and redirect after successful registration
    registerEvent(name, age, email, college, phone, paymentMethod, eventData, eventId).then(() => {
        // Add a delay before redirecting to index.html
        setTimeout(() => {
            window.location.href = '/paymentconfirm.html';
        }, 2000); // Adjust delay as needed
    }).catch((error) => {
        console.error('Error registering for event:', error.message);
        alert("Error registering the event. Try Again")
        // Handle error condition, show user an alert or retry logic
    });
});

// Function to register event in Firebase database
async function registerEvent(name, age, email, college, phone, paymentMethod, eventData, eventId) {
    try {
        // Get the currently logged-in user (if authentication is needed)
        const user = auth.currentUser;

        // Ensure user is authenticated
        if (user) {
            const registeredEventsRef = ref(database, `registeredEvents/${user.uid}/`);
            await push(registeredEventsRef, {
                name: name,
                age: age,
                email: email,
                college: college,
                phone: phone,
                paymentMethod: paymentMethod,
                registeredBy: user.uid,
                eventTitle: eventData.title,
                eventThumbnail: eventData.thumbnailURL,
                eventDate: eventData.endDate,
                eventOrganizer: eventData.createdBy
            });
            console.log('Event registered successfully');
        } else {
            console.error("No user logged in.");
        }
    } catch (error) {
        console.error('Error registering for event:', error.message);
        throw error; // Propagate error for further handling
    }
}

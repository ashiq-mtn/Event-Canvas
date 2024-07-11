import { app, database, auth } from './firebase.js';
import { ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

// Function to format the date in the desired format
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

// Function to delete an event
async function deleteEvent(eventCategory, eventId) {
    try {
        const user = auth.currentUser;
        if (user) {
            const eventRef = ref(database, `events/${eventCategory}/${eventId}`);
            await remove(eventRef);
            console.log("Event deleted successfully.");
            window.location.reload();
        } else {
            console.log("No user logged in.");
        }
    } catch (error) {
        console.error("Error deleting event:", error.message);
    }
}

// Function to handle view details
function handleViewDetails(event, eventId, eventCategory) {
    event.preventDefault();
    const eventDetailsRef = ref(database, `events/${eventCategory}/${eventId}`);
    onValue(eventDetailsRef, (snapshot) => {
        const eventData = snapshot.val();
        if (eventData) {
            const queryString = new URLSearchParams(eventData).toString();
            window.location.href = `/Events/eventDetails.html?${queryString}`;
        } else {
            console.error('Event data not found in Firebase');
        }
    }, (error) => {
        console.error('Error fetching event details from Firebase:', error);
    });
}

// Function to render event cards
function renderEventCard(event, eventCategory) {
    const { title, briefdescription, startDate, endDate, startTime, endTime, fee, location, thumbnailURL, eventLastDate, websiteLink, createdBy, eventId } = event;

    const { startDate: formattedStartDate, endDate: formattedEndDate, lastDate: formattedLastDate } = formatDate(startDate, endDate, eventLastDate);

    const eventDiv = document.createElement('div');
    eventDiv.classList.add('sub-event');

    const eventImage = document.createElement('img');
    eventImage.src = thumbnailURL;
    eventImage.alt = title;
    eventImage.classList.add('sub-event-image');

    const eventContentDiv = document.createElement('div');
    eventContentDiv.classList.add('sub-event-content');

    eventContentDiv.innerHTML = `
        <div class="card-body" id="listEventCard">
            <h5 class="card-title">${title}</h5>
            <p>${briefdescription}</p>
            <p><strong>Event Type:</strong> ${eventCategory.toUpperCase()}</p>
            <p><strong>Date and Time:</strong> ${formattedStartDate} and ${formatTime(startTime)} - ${formatTime(endTime)}</p>
            <p><strong>Last Date:</strong> ${formattedLastDate}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Registration Fee:</strong> &#x20B9;${fee}</p>
            <p><strong>Official Website:</strong> <a href="${websiteLink}" target="_blank" style="text-decoration: none;color: blue;">Official Event Website</a></p>
            <a href="#" class="btn btn-primary view-details-btn" id="viewDetailsBtn" data-event-id="${eventId}" style="float: right;">View Details</a>
        </div>
    `;

    // Append delete button if the user is the creator
    if (auth.currentUser && auth.currentUser.uid === createdBy) {
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-event-btn');
        deleteButton.textContent = 'Delete Event';
        deleteButton.dataset.eventId = eventId;
        deleteButton.dataset.eventCategory = eventCategory;
        deleteButton.style.marginRight = '10px';
        deleteButton.style.marginTop = '5px'; 
        eventContentDiv.querySelector('.card-body').appendChild(deleteButton);

        // Attach click event listener to delete button
        deleteButton.addEventListener('click', (e) => {
            e.preventDefault();
            deleteEvent(eventCategory, eventId);
        });
    }

    eventDiv.appendChild(eventImage);
    eventDiv.appendChild(eventContentDiv);

    const eventsContainer = document.querySelector('.sub-events');
    eventsContainer.appendChild(eventDiv);

    // Attach click event listener to view details button
    const viewDetailsButton = eventContentDiv.querySelector('.view-details-btn');
    viewDetailsButton.addEventListener('click', (e) => handleViewDetails(e, eventId, eventCategory));
}

// Function to display the events
function displayEvents(userId, eventType, containerId) {
    const eventsRef = ref(database, 'events/');
    onValue(eventsRef, (snapshot) => {
        const events = snapshot.val();
        let eventFound = false;

        const eventsContainer = document.getElementById(containerId);
        eventsContainer.innerHTML = '';

        for (const category in events) {
            for (const eventId in events[category]) {
                const event = events[category][eventId];

                if (event.createdBy === userId) {
                    event.eventId = eventId; // Add eventId to the event object
                    renderEventCard(event, category);
                    eventFound = true;
                }
            }
        }

        if (!eventFound) {
            const noEventsMessage = document.createElement('p');
            noEventsMessage.textContent = "You haven't created any events.";
            noEventsMessage.style.textAlign = 'center';
            noEventsMessage.style.fontSize = '22px';
            noEventsMessage.style.marginTop = '20px';
            eventsContainer.appendChild(noEventsMessage);
        }
    });
}

// Show or hide elements based on user state
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('profileDropdown').style.display = 'block';
        document.getElementById('signOutButton').style.display = 'block';
        document.getElementById('loginbtn').style.display = 'none';
        document.getElementById('eventbutton').style.display = 'block';
        document.getElementById('certificateLink').style.display = 'block';
        document.getElementById('displayHomePage').style.display = 'block';
        document.getElementById('loadingAnimation').style.display = 'none';

        // Retrieve user data from Firebase
        const userRef = ref(database, 'users/' + user.uid);

        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                // Access the user's data
                const therole = userData.role;
                console.log('Role: ', therole);

                if (therole != 'student') {
                    displayEvents(user.uid, therole, 'createdEventsContainer');
                }
            } else {
                console.log("User data not found");
            }
        });

    } else {
        window.location.href = '/Login/login.html';
    }
});

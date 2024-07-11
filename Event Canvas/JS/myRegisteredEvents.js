import { app, database, auth } from './firebase.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

// Function to render event card
function renderEventCard(event, eventId) {
    const { eventTitle, eventThumbnail, eventDate, name, eventOrganizer } = event; // Destructure event data

    console.log('Hey', event); // Log event object

    const eventDiv = document.createElement('div');
    eventDiv.classList.add('event-card');

    const eventImage = document.createElement('img');
    eventImage.src = eventThumbnail;
    eventImage.alt = eventTitle;
    eventImage.classList.add('event-thumbnail');

    const eventTitleElem = document.createElement('h3');
    eventTitleElem.textContent = eventTitle;
    eventTitleElem.classList.add('event-title');

    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'View Certificate';
    downloadButton.classList.add('download-btn');

    downloadButton.addEventListener('click', () => {
        const params = new URLSearchParams();
        params.append('eventId', eventId); // Append eventId
        params.append('name', name); // Append name
        params.append('eventTitle', eventTitle); // Append eventTitle
        params.append('eventThumbnail', eventThumbnail); // Append eventThumbnail
        params.append('eventDate', eventDate); // Append eventDate
        params.append('eventOrganizer', eventOrganizer); // Append eventDate

        // Redirect to certificates.html with parameters
        window.location.href = `/certificates.html?${params.toString()}`;
    });

    eventDiv.appendChild(eventImage);
    eventDiv.appendChild(eventTitleElem);
    eventDiv.appendChild(downloadButton);

    const eventsContainer = document.getElementById('registeredEventsContainer');
    eventsContainer.appendChild(eventDiv);
}

// Function to fetch and display registered events
function fetchRegisteredEvents(userId) {
    const registeredEventsRef = ref(database, `registeredEvents/${userId}`);
    onValue(registeredEventsRef, (snapshot) => {
        const events = snapshot.val();
        if (events) {
            Object.keys(events).forEach((eventId) => {
                const event = events[eventId];
                renderEventCard(event, eventId);
            });
        } else {
            const eventsContainer = document.getElementById('registeredEventsContainer');
            console.log('No registered events found');
            const noEventsMessage = document.createElement('p');
            noEventsMessage.textContent = "You haven't registered for any events.";
            noEventsMessage.style.textAlign = 'center';
            noEventsMessage.style.fontSize = '22px';
            noEventsMessage.style.marginTop = '20px';
            eventsContainer.appendChild(noEventsMessage);
        }
    }, (error) => {
        console.error('Error fetching registered events:', error);
    });
}

// Show or hide elements based on user state
auth.onAuthStateChanged((user) => {
    if (user) {
        const userRef = ref(database, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                // Access the user's data
                const therole = userData.role;
                
                if (therole == 'student') {
                    fetchRegisteredEvents(user.uid);
                }
                else {
                    console.log("No student");
                }

            } else {
                console.log("User data not found");
            }
        }, (error) => {
            console.error("Error fetching user data:", error);
        });

    } else {
        window.location.href = '/Login/login.html';
    }
});

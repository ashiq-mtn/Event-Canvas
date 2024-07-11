import { app, database } from './firebase.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

// Function to retrieve events data from Firebase and return a promise
function fetchUpcomingEvents(eventCategory) {
    return new Promise((resolve, reject) => {
        const eventsRef = ref(database, `events/${eventCategory}`);
        onValue(eventsRef, (snapshot) => {
            const eventData = snapshot.val();
            if (eventData) {
                const events = Object.keys(eventData).map(key => ({ key, ...eventData[key] }));
                resolve(events);
            } else {
                resolve([]); // Resolve with an empty array if no data found
            }
        }, (error) => {
            reject(`Error fetching ${eventCategory} data: ${error}`);
        });
    });
}

async function displayMaxUpcomingEvents() {
    console.log("Displaying maximum upcoming events from all categories combined");
    const eventCategories = ['workshop', 'collegeFest', 'conference', 'hackathon', 'internship', 'sportsTournament'];
    let allEvents = [];
    let hasEvents = false; // Flag to track if any events were found

    try {
        // Fetch events from all categories concurrently
        const promises = eventCategories.map(category => fetchUpcomingEvents(category).catch(error => {
            console.error(`Error fetching ${category} data: ${error}`);
            return []; // Return an empty array if fetching fails for a category
        }));
        const results = await Promise.all(promises);
        allEvents = results.flat(); // Flatten the array of arrays into a single array of events

        // Sort combined events by startDate
        allEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        // Display a maximum of 6 upcoming events
        const upcomingEventsContainer = document.getElementById('upcoming-events-container');
        upcomingEventsContainer.innerHTML = ''; // Clear previous content

        const currentDate = new Date(); // Get current date
        allEvents.forEach(event => {
            if (!hasEvents && new Date(event.startDate) > currentDate) {
                hasEvents = true; // Set flag to true if at least one event is found
            }

            if (hasEvents && event && new Date(event.startDate) > currentDate) {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('col-md-4');
                const eventCard = document.createElement('div');
                eventCard.classList.add('card', 'event-card');
                eventCard.addEventListener('click', () => handleViewDetails(event.key, event.eventCategory));
                const eventImage = document.createElement('img');
                eventImage.src = event.thumbnailURL;
                eventImage.classList.add('card-img-top');
                eventImage.alt = 'Event Image';
                const cardBody = document.createElement('div');
                cardBody.classList.add('card-body');
                const eventTitle = document.createElement('h5');
                eventTitle.classList.add('card-title');
                eventTitle.innerText = event.title;
                const seeMoreButton = document.createElement('a');
                seeMoreButton.href = '#';
                seeMoreButton.classList.add('btn', 'btn-primary');
                seeMoreButton.innerText = 'See More';

                cardBody.appendChild(eventTitle);
                cardBody.appendChild(seeMoreButton);
                eventCard.appendChild(eventImage);
                eventCard.appendChild(cardBody);
                eventDiv.appendChild(eventCard);
                upcomingEventsContainer.appendChild(eventDiv);
            }
        });

        // If no events were found, display the message
        if (!hasEvents) {
            const noEventsMessage = document.createElement('p');
            noEventsMessage.classList.add('no-events-message');          
                 
            // First line of message
            const line1 = document.createElement('span');
            line1.textContent = 'No upcoming events.';
            line1.classList.add('line1');

            // Second line of message
            const line2 = document.createElement('span');
            line2.textContent = 'Check Back Soon';
            line2.classList.add('line2');

            // Append both lines to the message container
            noEventsMessage.appendChild(line1);
            noEventsMessage.appendChild(document.createElement('br')); // Line break between lines
            noEventsMessage.appendChild(line2);

            upcomingEventsContainer.appendChild(noEventsMessage);

        }

    } catch (error) {
        console.error("Error:", error);
    }
}

// Call the function to display a maximum of 6 upcoming events from all categories combined
document.addEventListener('DOMContentLoaded', function() {
    displayMaxUpcomingEvents();
});


// Function to handle view details of an event
function handleViewDetails(eventId, eventCategory) {
    console.log("View details of event:", eventId, "in category:", eventCategory);
    
    // Retrieve event data from Firebase based on eventId and eventCategory
    getEventDataFromFirebase(eventId, eventCategory)
        .then(eventData => {
            // Convert event data to query string
            const queryString = new URLSearchParams(eventData).toString();
            // Redirect to the workshop details page with the event details as URL parameters
            window.location.href = `/Events/eventDetails.html?${queryString}`;
        })
        .catch(error => {
            console.error("Error fetching event data from Firebase:", error);
            // Handle error (e.g., display an error message to the user)
        });
}

// Function to retrieve event data from Firebase
function getEventDataFromFirebase(eventId, eventCategory) {
    return new Promise((resolve, reject) => {
        const eventRef = ref(database, `events/${eventCategory}/${eventId}`);
        onValue(eventRef, (snapshot) => {
            const eventData = snapshot.val();
            if (eventData) {
                resolve(eventData);
            } else {
                reject(`Event data not found for eventId: ${eventId} and eventCategory: ${eventCategory}`);
            }
        }, (error) => {
            reject(`Error fetching event data from Firebase: ${error}`);
        });
    });
}

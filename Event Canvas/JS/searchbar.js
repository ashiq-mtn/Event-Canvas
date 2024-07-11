import { app, database } from './firebase.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

// Function to retrieve events data from Firebase and return a promise
function fetchSearchDetails(eventCategory) {
    return new Promise((resolve, reject) => {
        const eventsRef = ref(database, `events/${eventCategory}`);
        onValue(eventsRef, (snapshot) => {
            const eventData = snapshot.val();
            if (eventData) {
                const events = Object.entries(eventData).map(([key, value]) => ({ key, ...value }));
                resolve(events);
            } else {
                reject(`${eventCategory} data not found`);
            }
        }, (error) => {
            reject(`Error fetching ${eventCategory} data: ${error}`);
        });
    });
}

// Function to display search results
export async function displaySearchResults(searchTerm) {
    const eventCategories = ['workshop', 'collegeFest', 'conference', 'hackathon', 'internship', 'sportsTournament'];
    let allEvents = [];

    try {
        // Fetch events from all categories concurrently
        const promises = eventCategories.map(category => fetchSearchDetails(category).catch(error => {
            console.error(`Error fetching ${category} data: ${error}`);
            return []; // Return an empty array if fetching fails for a category
        }));
        const results = await Promise.all(promises);
        allEvents = results.flat(); // Flatten the array of arrays into a single array of events

        // Clear previous search results
        const searchContainer = document.getElementById('searchResults');
        searchContainer.innerHTML = '';

        // Display a maximum of 6 upcoming events
        let displayedEventsCount = 0;
        allEvents.forEach(event => {
            // Filter events based on search term
            if (displayedEventsCount < 5 && event.title.toLowerCase().includes(searchTerm)) {// Adjusted condition
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('eventBox');
                eventDiv.addEventListener('click', () => handleViewDetails(event.key, event.eventCategory));
                const eventImage = document.createElement('img');
                eventImage.src = event.thumbnailURL;
                eventImage.classList.add('searchthumbnail');
                eventImage.alt = 'Event Image';
                const eventTitle = document.createElement('a');
                eventTitle.classList.add('event-Title');
                eventTitle.innerText = event.title;
                eventTitle.href = '#';

                const eventType = document.createElement('p');
                eventType.id = 'eventType';
                const formattedEventCategory = event.eventCategory.replace(/\b\w/g, (char) => char.toUpperCase());
                eventType.textContent = formattedEventCategory;

                eventDiv.appendChild(eventImage);
                eventDiv.appendChild(eventTitle);
                eventDiv.appendChild(eventType);
                searchContainer.appendChild(eventDiv);

                displayedEventsCount++;
            }
        });

        // Hide search results box if there are no matching events
        const searchBox = document.querySelector('.search-results');
        if (searchTerm === '' || displayedEventsCount === 0) {
            searchBox.style.display = 'none';
        } else {
            searchBox.style.display = 'block';
        }
        
    } catch (error) {
        console.error("Error:", error);
    }
}





// Call the function to display a maximum of 100  events from all categories combined
// displaySearchResults();


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




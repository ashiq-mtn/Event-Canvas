// Import Firebase modules
import { app, database } from './firebaseConfig.js';

function searchEvents() {
    const searchTerm = document.querySelector('.searchTerm').value.toLowerCase();
    const searchResultsContainer = document.getElementById('searchResults');

    // Clear previous search results
    searchResultsContainer.innerHTML = '';

    // Retrieve event titles from Firebase Realtime Database
    database.ref('events').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            const eventTitle = childSnapshot.val().title.toLowerCase();
            if (eventTitle.includes(searchTerm)) {
                const eventCard = document.createElement('div');
                eventCard.classList.add('search-result');
                eventCard.textContent = eventTitle;
                eventCard.addEventListener('click', function() {
                    redirectToEventDetails(eventTitle);
                });
                searchResultsContainer.appendChild(eventCard);
            }
        });
    });
}

function redirectToEventDetails(eventTitle) {
    // Redirect to the details page of the selected event
    // Implement your redirection logic here
    console.log(`Redirecting to details page of ${eventTitle}`);
}

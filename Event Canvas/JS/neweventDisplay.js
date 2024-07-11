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
            formattedStartDate,
            formattedEndDate,
            formattedLastDate
        };
    } else {
        // If startDate and endDate are different, display both
        return {
            formattedStartDate,
            formattedEndDate,
            formattedLastDate
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

function handleViewDetails(index, eventCategory) {
    const eventsRef = ref(database, `events/${eventCategory}`);
    onValue(eventsRef, (snapshot) => {
        const eventKeys = Object.keys(snapshot.val());
        if (index >= 0 && index < eventKeys.length) {
            const eventId = eventKeys[index];
            const eventRef = ref(database, `events/${eventCategory}/${eventId}`);
            onValue(eventRef, (snapshot) => {
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
        } else {
            console.error('Invalid event index:', index);
        }
    }, (error) => {
        console.error('Error fetching event keys from Firebase:', error);
    });
}

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

function displayEvents(eventCategory) {
    console.log(`Displaying event category: ${eventCategory}`);
    const eventsRef = ref(database, `events/${eventCategory}`);
    onValue(eventsRef, (snapshot) => {
        const eventData = snapshot.val();
        if (eventData) {
            const eventsArray = Object.entries(eventData).map(([eventId, eventData]) => ({ eventId, ...eventData }));
            eventsArray.forEach((event, index) => {
                event.originalIndex = index;
            });
            eventsArray.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
            const eventKeys = eventsArray.map(event => event.eventId);

            const eventsContainer = document.querySelector('.sub-events');
            eventsContainer.innerHTML = '';
            eventsArray.forEach((event, index) => {
                const originalIndex = event.originalIndex;
                console.log(originalIndex);

                const eventDiv = document.createElement('div');
                eventDiv.classList.add('sub-event');
                const eventImage = document.createElement('img');
                eventImage.src = event.thumbnailURL;
                eventImage.alt = event.title;
                eventImage.classList.add('sub-event-image');
                const eventContentDiv = document.createElement('div');
                eventContentDiv.classList.add('sub-event-content');

                const { formattedStartDate, formattedEndDate, formattedLastDate } = formatDate(event.startDate, event.endDate, event.eventLastDate);
                eventContentDiv.innerHTML = `
                    <div class="card-body" id="listEventCard">
                        <h5 class="card-title">${event.title}</h5>
                        <p>${event.briefdescription}</p>
                        <p><strong>Date and Time:</strong> ${formattedStartDate} - ${formattedEndDate} and ${formatTime(event.startTime)} - ${formatTime(event.endTime)}</p>
                        <p><strong>Last Date:</strong> ${formattedLastDate}</p>
                        <p><strong>Location:</strong> ${event.location}</p>
                        <p><strong>Registration Fee:</strong> &#x20B9;${event.fee}</p>
                        <p><strong>Official Website:</strong> <a href="${event.websiteLink}" target="_blank" style="text-decoration: none;color: blue;">Official Event Website</a></p>
                        <a href="#" class="btn btn-primary view-details-btn" id="viewDetailsBtn" data-event-index="${index}" style="float: right;">View Details</a>
                    </div>
                `;

                // Append delete button if the user is the creator
                if (auth.currentUser && auth.currentUser.uid === event.createdBy) {
                    const deleteButton = document.createElement('button');
                    deleteButton.classList.add('delete-event-btn');
                    deleteButton.textContent = 'Delete Event';
                    deleteButton.dataset.eventId = event.eventId;
                    deleteButton.dataset.eventCategory = eventCategory;
                    deleteButton.style.marginRight = '10px';
                    deleteButton.style.marginTop = '-10px';
                    eventContentDiv.querySelector('.card-body').appendChild(deleteButton);

                    // Attach click event listener to delete button
                    deleteButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        deleteEvent(eventCategory, event.eventId);
                    });
                }

                eventDiv.appendChild(eventImage);
                eventDiv.appendChild(eventContentDiv);
                eventsContainer.appendChild(eventDiv);
            });

            const viewDetailsButtons = document.querySelectorAll('.sub-event .view-details-btn');
            viewDetailsButtons.forEach((button, index) => {
                const originalIndex = eventsArray[index].originalIndex;
                button.addEventListener('click', () => handleViewDetails(originalIndex, eventCategory));
            });
        } else {

            //No events found
            console.log(`${eventCategory} data not found`);
            const eventsContainer = document.querySelector('.sub-events');
            eventsContainer.innerHTML = '';
            const noEventsMessage = document.createElement('p');
            noEventsMessage.textContent = 'No upcoming events at this time.';
            noEventsMessage.classList.add('no-events-message');
            eventsContainer.appendChild(noEventsMessage);
        }
    }, (error) => {
        console.error(`Error fetching ${eventCategory} data:`, error);
    });
}

// Export the displayEvents function
export { displayEvents };

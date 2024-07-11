import { app, database } from './firebase.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

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

// Function to format date to DD Month YYYY format
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    return `${day} ${monthNames[monthIndex]} ${year}`;
}

// Function to update certificate HTML with event details
function updateCertificateUI(eventData) {
    const { eventTitle, eventDate, name, eventOrganizer } = eventData;

    // Format event date to DD Month YYYY format
    const formattedEventDate = formatDate(eventDate);

    // Update HTML elements with event details
    document.getElementById('eventName').textContent = eventTitle;
    document.getElementById('eventDate').textContent = formattedEventDate;
    document.getElementById('participantName').textContent = name;

}

// Initialize script on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get event data from URL query string
        const eventData = getEventDataFromQueryString();

        console.log(eventData);

        // Retrieve user data from Firebase
        const userRef = ref(database, 'users/' + eventData.eventOrganizer);

        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                document.getElementById('cordinator').textContent = userData.username;
            } else {
                console.log("User data not found");
            }
        }, (error) => {
            console.error("Error fetching user data:", error);
        });

        // Update certificate UI with event details
        updateCertificateUI(eventData);
        
    } catch (error) {
        console.error('Error fetching or updating certificate details:', error);
    }
});

document.getElementById('downloadbtn').addEventListener('click', function () {
    const certificate = document.getElementById('certificate');
    const options = {
        margin: [10, 10, 10, 10],  // Use array to specify margins for top, right, bottom, left in mm
        filename: 'certificate.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },  // Increase scale for better quality
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    // Call html2pdf with the element and options
    html2pdf().from(certificate).set(options).save();

});

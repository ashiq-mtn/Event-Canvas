//Scrolling towards Events from Navbar
function scrollToUpcomingEvents() {
    var eventsSection = document.getElementById('events-section');
    eventsSection.scrollIntoView({ behavior: 'smooth' });
}
function scrollToEventCategory() {
    var eventsSection = document.getElementById('events-categories');
    eventsSection.scrollIntoView({ behavior: 'smooth' });
}

//DropDown Toggle
function toggleDropdown() {
    var dropdownContent = document.getElementById("dropdownContent");
    dropdownContent.style.display = (dropdownContent.style.display === "block") ? "none" : "block";
}

function redirectToEventDetails(eventName) {
    window.location.href = 'event_details.html?event=' + encodeURIComponent(eventName);
}
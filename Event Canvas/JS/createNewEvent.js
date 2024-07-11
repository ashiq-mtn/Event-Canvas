import { app, database, storage, auth } from './firebase.js';
import { ref, push } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";


const stepMenuOne = document.querySelector('.formbold-step-menu1');
const stepMenuTwo = document.querySelector('.formbold-step-menu2');

const stepOne = document.querySelector('.formbold-form-step-1');
const stepTwo = document.querySelector('.formbold-form-step-2');

const nextStepBtn = document.getElementById('nextStepBtn');
const formBackBtn = document.querySelector('.formbold-back-btn');
const createEventBtn = document.getElementById('createEventBtn');

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('startTime').value = '10:00';
    document.getElementById('endTime').value = '12:00';
});


// Initially hide the Create Event button
createEventBtn.style.display = 'none';

nextStepBtn.addEventListener("click", function (event) {

    event.preventDefault();
    nextStepBtn.style.display = 'none';
    createEventBtn.style.display = 'block';

    if (stepMenuOne.classList.contains('active')) {
        event.preventDefault();
        console.log('Page 1');
        stepMenuOne.classList.remove('active');
        stepMenuTwo.classList.add('active');

        stepOne.classList.remove('active');
        stepTwo.classList.add('active');

        formBackBtn.classList.add('active');

        formBackBtn.addEventListener("click", function (event) {
            event.preventDefault();

            stepMenuOne.classList.add('active');
            stepMenuTwo.classList.remove('active');

            stepOne.classList.add('active');
            stepTwo.classList.remove('active');
            formBackBtn.classList.remove('active');

            createEventBtn.style.display = 'none';
            nextStepBtn.style.display = 'block';
        });


    } else if (stepMenuTwo.classList.contains('active')) {
        console.log('Page 2');
        stepMenuTwo.classList.remove('active');
        stepTwo.classList.remove('active');
        formBackBtn.classList.remove('active');
    }
});




createEventBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // Log all form input values to the console
    const inputs = document.querySelectorAll('input, select, textarea');
    const formData = {};
    inputs.forEach(input => {
        formData[input.name] = input.value;
    });

    // Log selected checkboxes
    const checkboxes = document.querySelectorAll('.department-checkbox:checked');
    const selectedDepartments = [];
    checkboxes.forEach(checkbox => {
        selectedDepartments.push(checkbox.value);
    });

    // Add selected departments to formData
    formData.selectedDepartments = selectedDepartments;

    const eventDept = formData.selectedDepartments;

    console.log('Events are : ' + eventDept);

    const eventTitle = document.getElementById('eventTitle').value;
    const briefDescription = document.getElementById('briefDesc').value;
    const eventCategory = document.getElementById('eventCategories').value; // Get the selected category
    const eventType = document.getElementById('eventType').value; // Get the selected type
    const file = document.getElementById('eventThumbnail').files[0]; // Get the uploaded file
    const eventStartDate = document.getElementById('startDate').value;
    const eventEndDate = document.getElementById('endDate').value;
    const eventStartTime = document.getElementById('startTime').value;
    const eventEndTime = document.getElementById('endTime').value;
    const eventLastDate = document.getElementById('lastDate').value;
    const detailedDescription = document.getElementById('detailedDescription').value;
    const name1 = document.getElementById('name1').value;
    const phonenumber1 = document.getElementById('phonenumber1').value;
    const name2 = document.getElementById('name2').value;
    const phonenumber2 = document.getElementById('phonenumber2').value;
    const registrationFee = document.getElementById('regFee').value;
    const eventLocation = document.getElementById('eventLocation').value;
    const websiteLink = document.getElementById('websiteLink').value;


    console.log(eventTitle, briefDescription, eventCategory, eventType, file, eventStartDate, eventEndDate, eventStartTime, eventEndTime, eventLastDate, detailedDescription, name1, phonenumber1, name2, phonenumber2, registrationFee, eventLocation, websiteLink);

    try {
        // Upload image to Firebase Storage
        const storageReference = storageRef(storage, 'thumbnails/' + file.name);
        const uploadTask = uploadBytes(storageReference, file);
        uploadTask.then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadURL) => {

                const currentDate = new Date();
                const lastRegDate = new Date(eventLastDate);
                const eventDStartDate = new Date(eventStartDate);
                const eventDEndDate = new Date(eventEndDate);
                currentDate.setHours(0, 0, 0, 0);
                lastRegDate.setHours(0, 0, 0, 0);
                eventDStartDate.setHours(0, 0, 0, 0);
                eventDEndDate.setHours(0, 0, 0, 0);


                if (lastRegDate < currentDate || eventDStartDate < currentDate || eventDEndDate < currentDate) {
                    alert("Date of registration is error");
                }
                else {
                    // Create new event in Firebase Database
                    createNewEvent(eventTitle, briefDescription, eventCategory, eventDept, eventType, downloadURL, eventStartDate, eventEndDate, eventStartTime, eventEndTime, eventLastDate, detailedDescription, name1, phonenumber1, name2, phonenumber2, registrationFee, eventLocation, websiteLink);
                    alert("Event has been successfully created");


                    // Submit the form
                    const form = document.querySelector('form');
                    form.submit();

                    // Add a delay of 1 seconds before redirecting to index.html
                    setTimeout(() => {
                        document.getElementById('createEventForm').reset();
                        window.location.href = '/index.html';
                    }, 2000);
                }



            }).catch((error) => {
                console.error('Error getting download URL:', error);
                alert('An error occurred while creating the event. Please try again.');
            });
        }).catch((error) => {
            console.error('Error uploading file:', error);
            alert('An error occurred while uploading the file. Please try again.');
        });

    } catch (error) {
        console.error('Error creating event:', error);
        alert('An error occurred while creating the event. Please try again.');
    }

});


// Function to create a new event in Firebase database
async function createNewEvent(eventTitle, briefDescription, eventCategory, eventDept, eventType, downloadURL, eventStartDate, eventEndDate, eventStartTime, eventEndTime, eventLastDate, detailedDescription, name1, phoneNumber1, name2, phoneNumber2, registrationFee, eventLocation, websiteLink) {
    try {
        // Get the currently logged-in user
        const user = auth.currentUser;

        if (user) {
            // Encode newline characters in detailedDescription
            const encodedDetailedDescription = detailedDescription.replace(/\n/g, '<br>');

            // Include user's information in the event data
            const eventsRef = ref(database, 'events/' + eventCategory);
            const newEventRef = push(eventsRef, {
                title: eventTitle,
                briefdescription: briefDescription,
                eventCategory: eventCategory,
                eventType: eventType,
                startDate: eventStartDate,
                endDate: eventEndDate,
                startTime: eventStartTime,
                endTime: eventEndTime,
                eventLastDate: eventLastDate,
                detailedDescription: encodedDetailedDescription, // Use the encoded description
                orgName1: name1,
                orgPhone1: phoneNumber1,
                orgName2: name2,
                orgPhone2: phoneNumber2,
                fee: registrationFee,
                location: eventLocation,
                eventDept: eventDept,
                websiteLink: websiteLink,
                thumbnailURL: downloadURL,
                createdBy: user.uid, // Include user's UID
                createdByEmail: user.email, // Include user's email
            });

            // Get the key of the newly pushed event
            const eventKey = newEventRef.key;

            // Log the event key
            console.log("Newly created event key:", eventKey);

            // Use the event key for any further operations, such as deleting the event
        } else {
            console.log("No user logged in.");
        }
    } catch (error) {
        console.error('Error creating new event:', error.message);
    }
}

// Select all checkboxes
const checkboxes = document.querySelectorAll('.department-checkbox');

// Function to log selected checkboxes with their names
function logSelectedCheckboxes() {
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            console.log(`${checkbox.value}`);
        }
    });
}

// Attach event listener to checkboxes to log selected checkboxes when their state changes
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', logSelectedCheckboxes);
});


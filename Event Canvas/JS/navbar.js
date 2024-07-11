// Function to handle scroll event
const component = document.getElementById('navigationPanel');
function handleScroll() {
    // Get the current scroll position
    const scrollPosition = window.scrollY || window.pageYOffset;

    if (scrollPosition > 400) {
        component.classList.add('scrolled');
    } else {
        component.classList.remove('scrolled');
    }
}
// Add scroll event listener after DOM content is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('scroll', handleScroll);
});

// Import the functions you need from the SDKs you need
import { app, database, auth } from './firebase.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        document.getElementById("profileDropdown").style.display = "block";
        document.getElementById("loginbtn").style.display = "none";

        // Check if the current page is the "Certificate" page
        var isCertificatePage = document.body.id === "certificatePage";
        if (isCertificatePage) {
            document.getElementById("certificateLink").style.display = "none";
        }
        else {
            document.getElementById("certificateLink").style.display = "block";
        }

        // Retrieve user data from Firebase
        const userRef = ref(database, 'users/' + user.uid);

        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                // Access the user's data
                const therole = userData.role;
                console.log('Role: ', therole);

                if (therole == 'student') {
                    document.getElementById("myevents").style.display = "none";
                }
                else {
                    document.getElementById("certificateLink").style.display = "none";
                    // Check if the current page is the "Create Event" page
                    var isCreateEventPage = document.body.id === "createEventPage";
                    if (isCreateEventPage) {
                        document.getElementById("eventbutton").style.display = "none";
                    }
                    else {
                        document.getElementById("eventbutton").style.display = "block";
                    }
                }

            } else {
                console.log("User data not found");
            }
        }, (error) => {
            console.error("Error fetching user data:", error);
        });


    } else {
        // User is signed out
        document.getElementById("profileDropdown").style.display = "none";
        document.getElementById("loginbtn").style.display = "block";
    }
});

const signOutButton = document.getElementById('signOutButton');

signOutButton.addEventListener('click', () => {

    const auth = getAuth();
    signOut(auth).then(() => {
        // Sign-out successful.
        var islandingPage = document.body.id === "landingPage";
        if (islandingPage || isCreateEventPage) {
            window.location.href = 'index.html';
        }
        else {
            window.location.href = '/index.html';
        }
        
    }).catch((error) => {
        // An error happened.
    });

});





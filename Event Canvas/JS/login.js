// Import the functions you need from the SDKs you need
import { app, database, auth } from './firebase.js';
import { update, ref } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const provider = new GoogleAuthProvider();

const loginbtn = document.getElementById('loginbtn'); // Select the button by its ID
const loginForm = document.getElementById('loginForm'); // Select the form by its ID
const googleSignIn = document.getElementById('googleSignIn'); // Select the button by its ID


loginbtn.addEventListener('click', (e) => {

    e.preventDefault(); // Prevent form submission

    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    // Perform client-side validation
    if (!email || !password) {
        alert('Please enter both email and password.');
        return; // Exit the function if either field is empty
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed In
            const user = userCredential.user;

            const dt = new Date();
            update(ref(database, 'users/' + user.uid), {
                last_login: dt
            });
            // Wait for 1 second (1000 milliseconds) before redirecting to index.html
            setTimeout(() => {
                loginForm.reset();
                window.location.href = '/index.html';
            }, 1000);

        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            alert(errorMessage);
        });

});

googleSignIn.addEventListener('click', (e) => {

    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;

            // alert(user.displayName);

            const dt = new Date();
            update(ref(database, 'users/' + user.uid), {
                email: user.email,
                last_login: dt
            });
            // Wait for 1 second (1000 milliseconds) before redirecting to index.html
            setTimeout(() => {
                loginForm.reset();
                window.location.href = '/index.html';
            }, 1000);

        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
});
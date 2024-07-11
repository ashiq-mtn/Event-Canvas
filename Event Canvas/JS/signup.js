// Imported SDKs
import { app, database, auth } from './firebase.js';
import { set, ref } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

// Initialize Firebase
const provider = new GoogleAuthProvider();

//Retriving each role to handle other operations
document.getElementById("studentBox").addEventListener("click", (e) => handleClick("student"));
document.getElementById("collegeBox").addEventListener("click", (e) => handleClick("college"));
document.getElementById("companyBox").addEventListener("click", (e) => handleClick("company"));

// Define a global variable to store the role and setting student as default role
let selectedRole = 'student';

// Function to handle radio button clicks and update the selected role
function handleClick(userType) {
    selectUserType(userType);
    checkRadioButton(userType);
    selectedRole = userType; // Update the selected role
}

function checkRadioButton(id) {
    document.getElementById(id).checked = true;
}

// Function to check password strength
function isPasswordStrong(password) {
    // You can implement your own password strength check logic here
    // Check for minimum length, presence of uppercase letters, lowercase letters, numbers, and special characters
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

function selectUserType(userType) {
    const studentFields = document.getElementById('student-fields');
    const organizationFields = document.getElementById('organization-fields');

    if (userType === 'student') {
        studentFields.style.display = 'flex';
        organizationFields.style.display = 'none';

    } else {
        studentFields.style.display = 'none';
        organizationFields.style.display = 'flex';
    }

}

const signUp = document.getElementById('signUp');
const signUpForm = document.getElementById('signupForm');
let studentName, institutionName, website;

//Function after clicking the Register button
signUp.addEventListener('click', (e) => {
    e.preventDefault();
    const role = selectedRole;

    if (role === 'student') {
        studentName = document.getElementById('studentName').value;
        var email = document.getElementById('studentMail').value;
        var password = document.getElementById('studentPassword').value;
    } else {
        institutionName = document.getElementById('institutionName').value;
        website = document.getElementById('website').value;
        email = document.getElementById('organizationMail').value;
        password = document.getElementById('organizationPassword').value;
    }

    // Check password strength
    if (!isPasswordStrong(password)) {
        alert("Use a strong password (minimum 8 characters with uppercase, lowercase, number, and special character)");
        return; // Prevent further execution
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            if (role === 'college' || role === 'company') {
                setUserData(user.uid, role, institutionName, email, website);
            } else {
                setUserData(user.uid, role, studentName, email);
            }

            // Wait for 1 second (1000 milliseconds) before redirecting to index.html
            setTimeout(() => {
                signUpForm.reset();
                window.location.href = '/index.html';
            }, 1000);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            alert(errorMessage);
        });
});

function setUserData(uid, role, username, email, website = null) {
    const userData = {
        role: role,
        email: email,
        username: username
    };
    if (role === 'college' || role === 'company') {
        userData.website = website;
    }
    //Inserting values to Realtime Database
    set(ref(database, 'users/' + uid), userData);
}

googleButton.addEventListener('click', (e) => {
    e.preventDefault();
    const role = selectedRole;
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            if (role === 'college' || role === 'company') {
                setUserData(user.uid, role, user.displayName, user.email, null);
            } else {
                setUserData(user.uid, role, user.displayName, user.email);
            }
            // Wait for 1 second (1000 milliseconds) before redirecting to index.html
            setTimeout(() => {
                signUpForm.reset();
                window.location.href = '/index.html';
            }, 1000);
        })
        .catch(handleError);
});
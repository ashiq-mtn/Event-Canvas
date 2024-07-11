window.addEventListener('load', function () {
    // Show loading animation
    showLoadingAnimation();

    // Simulate a delay before hiding the loader and showing content
    const delayInMilliseconds = 1800; // Adjust as needed

    setTimeout(function () {
        hideLoadingAnimation();
        showContent();
    }, delayInMilliseconds);
});

// Show the content of the workshop page
function showContent() {
    // Show the content container
    document.getElementById('displayHomePage').style.display = 'block';
}

// Show the loading animation
function showLoadingAnimation() {
    const loadingAnimation = document.getElementById('loadingAnimation');
    loadingAnimation.style.display = 'block';
}

// Hide the loading animation and show content
function hideLoadingAnimation() {
    const loadingAnimation = document.getElementById('loadingAnimation');
    loadingAnimation.style.display = 'none';
}

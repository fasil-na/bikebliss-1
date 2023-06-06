let bannerTitle = false
let bannerDescription = false

function updateSubmitButton() {

    const submitButton = document.getElementById('submitButton');

    if (bannerTitle&&bannerDescription) {
        submitButton.removeAttribute('disabled');
    } else {
        submitButton.setAttribute('disabled', 'disabled');
    }
}

function validateBannerTitle() {
    let name = document.getElementById("title").value.trim();
    const nameRegex = /^[A-Za-z\s]+$/;
    const submitButton = document.getElementById("submitButton");

    if (!name) {
        bannerTitle = false;
        document.getElementById("titleError").innerText = "Banner title is required";
        submitButton.disabled = true; 
    } else if (!name.match(nameRegex)) {
        bannerTitle = false;
        document.getElementById("titleError").innerText = "Banner title can only contain letters and spaces";
        submitButton.disabled = true; 
    } else if (name.length > 25) {
        bannerTitle = false;
        document.getElementById("titleError").innerText = "Banner title cannot exceed 25 characters";
        submitButton.disabled = true; 
    } else {
        bannerTitle = true;
        document.getElementById("titleError").innerText = "";
        updateSubmitButton();
    }
}

function validateBannerDescription() {
    let description = document.getElementById("description").value.trim();
    const submitButton = document.getElementById("submitButton");

    if (!description) {
        bannerDescription = false;
        document.getElementById("descriptionError").innerText = "Banner description is required";
        submitButton.disabled = true; 
    } else {
        bannerDescription = true;
        document.getElementById("descriptionError").innerText = "";
        updateSubmitButton();
    }
}













let categoryName = false

function updateSubmitButton() {

    const submitButton = document.getElementById('submitButton');

    if (categoryName) {
        submitButton.removeAttribute('disabled');
    } else {
        submitButton.setAttribute('disabled', 'disabled');
    }
}

function validateCategoryName() {
    let name = document.getElementById("name").value.trim();
    const nameRegex = /^[A-Za-z\s]+$/;
    const submitButton = document.getElementById("submitButton");

    if (!name) {
        categoryName = false;
        document.getElementById("nameError").innerText = "Category name is required";
        submitButton.disabled = true; 
    } else if (!name.match(nameRegex)) {
        categoryName = false;
        document.getElementById("nameError").innerText = "Category name can only contain letters and spaces";
        submitButton.disabled = true; 
    } else if (name.length > 25) {
        categoryName = false;
        document.getElementById("nameError").innerText = "Category name cannot exceed 25 characters";
        submitButton.disabled = true; 
    } else {
        categoryName = true;
        document.getElementById("nameError").innerText = "";
        updateSubmitButton();
    }
}













let username = false
let useremail = false
let usernumber = false
let userpassword = false
let userconfirmpassword=false


function updateSubmitButton() {

    const submitButton = document.getElementById('submitButton');

    if (username && useremail && usernumber && userpassword && userconfirmpassword) {
        submitButton.removeAttribute('disabled');
    } else {
        submitButton.setAttribute('disabled', 'disabled');
    }
}



function validateName() {
    let name = document.getElementById("name").value
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!name) {
        username = false
        document.getElementById("nameError").innerText = "Name is required"
    } else if (!name.match(nameRegex)) {
        username = false
        document.getElementById("nameError").innerText = "Name can only contain letters and spaces"
    } else {
        username = true;
        document.getElementById("nameError").innerText = ""
        updateSubmitButton();
    }
}

function validateEmail() {
    let email = document.getElementById("email").value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        useremail = false
        document.getElementById("emailError").innerText = "Email is required"
    } else if (!email.match(emailRegex)) {
        useremail = false
        document.getElementById("emailError").innerText = "Please enter a valid email address"
    } else {
        useremail = true
        document.getElementById("emailError").innerText = ""
        updateSubmitButton();
    }
}


function validateMobile() {
    let mobile = document.getElementById("number").value;
    const mobileRegex = /^\d{10}$/;
    if (!mobile) {
        usernumber = false
        document.getElementById("numberError").innerText = "Mobile number is required"
    } else if (!mobile.match(mobileRegex)) {
        usernumber = false
        document.getElementById("numberError").innerText = "Please enter a valid 10-digit mobile number"
    } else {
        usernumber = true
        document.getElementById("numberError").innerText = ""
        updateSubmitButton();
    }
}

function validatePassword() {
    let password = document.getElementById("password").value;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    if (!password) {
        userpassword = false
        document.getElementById("passwordError").innerText = "Password is required"
    }
    else if (!password.match(passwordRegex)) {
        userpassword = false
        document.getElementById("passwordError").innerText = "Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, and one digit"
    } else {
        userpassword = true
        document.getElementById("passwordError").innerText = ""
        updateSubmitButton();
    }
}

function validateConfirmPassword() {
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirm_password").value;


    if (!confirmPassword) {
        userconfirmpassword = false;
        document.getElementById("confirm_passwordError").innerText = "Confirm password is required";
    }
    else if (password !== confirmPassword) {
        userconfirmpassword = false;
        document.getElementById("confirm_passwordError").innerText = "Passwords do not match";
    }

    else {
        userconfirmpassword = true;
        document.getElementById("confirm_passwordError").innerText = "";
        updateSubmitButton();
    }
}









let username = false
let useremail = false
let usernumber = false




function validateName() {
    let name = document.getElementById("newName").value
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
    }
}

function validateEmail() {
    let email = document.getElementById("newEmail").value;
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
    }
}


function validateMobile() {
    let mobile = document.getElementById("newNumber").value;
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

    }
}


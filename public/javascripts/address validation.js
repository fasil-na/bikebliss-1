let aName = false
let aEmail = false
let aNumber = false
let pinCodeValid=false
let countryNameValid=false


function updateASubmitButton() {

    const submitButton = document.getElementById('aSubmitButton');

    if (aName && aEmail && aNumber && pinCodeValid &&countryNameValid) {
        submitButton.removeAttribute('disabled');
    } else {
        submitButton.setAttribute('disabled', 'disabled');
    }
}



function validateAName() {
    let name = document.getElementById("aName").value.trim()
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!name) {
        aName = false
        document.getElementById("aNameError").innerText = "Name is required"
    } else if (!name.match(nameRegex)) {
        aName = false
        document.getElementById("aNameError").innerText = "Name can only contain letters and spaces"
    } else {
        aName = true;
        document.getElementById("aNameError").innerText = ""
        updateASubmitButton();
    }
}

function validateAEmail() {
    let email = document.getElementById("aEmail").value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        aEmail = false
        document.getElementById("aEmailError").innerText = "Email is required"
    } else if (!email.match(emailRegex)) {
        aEmail = false
        document.getElementById("aEmailError").innerText = "Please enter a valid email address"
    } else {
        aEmail = true
        document.getElementById("aEmailError").innerText = ""
        updateASubmitButton();
    }
}


function validateAMobile() {
    let mobile = document.getElementById("aNumber").value;
    const mobileRegex = /^\d{10}$/;
    if (!mobile) {
        aNumber = false
        document.getElementById("aNumberError").innerText = "Mobile number is required"
    } else if (!mobile.match(mobileRegex)) {
        aNumber = false
        document.getElementById("aNumberError").innerText = "Please enter a valid 10-digit mobile number"
    } else {
        aNumber = true
        document.getElementById("aNumberError").innerText = ""
        updateASubmitButton();
    }
}

function validatePinCode() {
    let pinCode = document.getElementById("pin").value;
    const pinCodeRegex = /^\d{6}$/;
    
    if (!pinCode) {
      pinCodeValid = false;
      document.getElementById("pinError").innerText = "Pin code is required";
    } else if (!pinCode.match(pinCodeRegex)) {
      pinCodeValid = false;
      document.getElementById("pinError").innerText = "Please enter a valid 6-digit pin code";
    } else {
      pinCodeValid = true;
      document.getElementById("pinError").innerText = "";
      updateASubmitButton();
    }
  }

  function validateCountryName() {
    let countryName = document.getElementById("countryName").value.trim();
    const countryNameRegex = /^[a-zA-Z\s]+$/;
    
    if (!countryName) {
      countryNameValid = false;
      document.getElementById("countryNameError").innerText = "Country name is required";
    } else if (!countryName.match(countryNameRegex)) {
      countryNameValid = false;
      document.getElementById("countryNameError").innerText = "Please enter a valid country name";
    } else {
      countryNameValid = true;
      document.getElementById("countryNameError").innerText = "";
      updateASubmitButton();
    }
  }
  
  











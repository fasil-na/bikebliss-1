let couponCode = false
let couponDiscount = false
let couponExpiry = false


const updateSubmitButton = () => {
  const submitButton = document.getElementById('submitButton');
  if (couponCode && couponDiscount && couponExpiry) {
    submitButton.removeAttribute('disabled');
  } else {
    submitButton.setAttribute('disabled', 'disabled');
  }
  return true;
}

function validateName() {
  let name = document.getElementById("name").value.trim();
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!name) {
    couponCode = false
    document.getElementById("nameError").innerText = "Name is required"
  } else if (!name.match(nameRegex)) {
    couponCode = false
    document.getElementById("nameError").innerText = "Name can only contain letters and spaces"
  } else if (name.length > 25) {
    couponCode = false;
    document.getElementById("nameError").innerText = "Name cannot exceed 25 characters";
  } else {
    couponCode = true;
    document.getElementById("nameError").innerText = ""
    updateSubmitButton();
  }
}

function validatePercentage() {
  let percentage = document.getElementById("percentage").value;
  const percentageRegex = /^(?!0$)\d+$/;
  const maxDiscount = 70;

  if (!percentage) {
    couponDiscount = false;
    document.getElementById("percentageError").innerText = "Percentage is required";
  } else if (!percentage.match(percentageRegex)) {
    couponDiscount = false;
    document.getElementById("percentageError").innerText = "Percentage should be a positive number";
  } else if (percentage > maxDiscount) {
    couponDiscount = false;
    document.getElementById("percentageError").innerText = "Maximum discount is 70";
  } else {
    couponDiscount = true;
    document.getElementById("percentageError").innerText = "";
    updateSubmitButton();
  }
}


function validateExpiryDate() {
  let expiryDateInput = document.getElementById("date");
  let expiryDate = expiryDateInput.value;
  if (!expiryDate) {
    couponExpiry = false;
    document.getElementById("expiryDateError").innerText = "Expiry date is required";
  } else {
    let currentDate = new Date();
    let selectedDate = new Date(expiryDate);
    if (selectedDate < currentDate) {
      couponExpiry = false;
      document.getElementById("expiryDateError").innerText = "Expiry date must be in the future";
    } else {
      couponExpiry = true;
      const ret = updateSubmitButton();
      document.getElementById("expiryDateError").innerText = "";

    }
  }
}



















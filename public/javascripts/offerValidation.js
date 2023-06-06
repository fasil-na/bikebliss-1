let offerName = false
let offerPercentage = false

function updateSubmitButton() {

  const submitButton = document.getElementById('submitButton');

  if (offerName && offerPercentage) {
    submitButton.removeAttribute('disabled');
  } else {
    submitButton.setAttribute('disabled', 'disabled');
  }
}



function validateName() {
  let name = document.getElementById("name").value.trim();
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!name) {
    offerName = false
    document.getElementById("nameError").innerText = "Name is required"
  } else if (!name.match(nameRegex)) {
    offerName = false
    document.getElementById("nameError").innerText = "Name can only contain letters and spaces"
  } else if (name.length > 25) {
    offerName = false;
    document.getElementById("nameError").innerText = "Name cannot exceed 25 characters";
  } else {
    offerName = true;
    document.getElementById("nameError").innerText = ""
    updateSubmitButton();
  }
}

function validatePercentage() {
  let percentage = document.getElementById("percentage").value;
  const percentageRegex = /^(?!0$)\d+$/;
  const maxDiscount = 70;

  if (!percentage) {
    offerPercentage = false;
    document.getElementById("percentageError").innerText = "Percentage is required";
  } else if (!percentage.match(percentageRegex)) {
    offerPercentage = false;
    document.getElementById("percentageError").innerText = "Percentage should be a positive number";
  } else if (percentage > maxDiscount) {
    offerPercentage = false;
    document.getElementById("percentageError").innerText = "Maximum discount is 70";
  } else {
    offerPercentage = true;
    document.getElementById("percentageError").innerText = "";
    updateSubmitButton();
  }
}

















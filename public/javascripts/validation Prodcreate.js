let productName = false
let productPrice = false
let productStock = false

function updateSubmitButton() {

    const submitButton = document.getElementById('submitButton');

    if (productName && productPrice && productStock) {
        submitButton.removeAttribute('disabled');
    } else {
        submitButton.setAttribute('disabled', 'disabled');
    }
}



function validateProductName() {
    let name = document.getElementById("name").value
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!name) {
        productName = false
        document.getElementById("nameError").innerText = " Product name is required"
    } else if (!name.match(nameRegex)) {
        productName = false
        document.getElementById("nameError").innerText = "Product name can only contain letters and spaces"
    } else {
        productName = true;
        document.getElementById("nameError").innerText = ""
        updateSubmitButton();
    }
}


function validateProductPrice() {
    let price = document.getElementById("price").value;
    if (!price) {
        document.getElementById("priceError").innerText = "Product price is required";
        productPrice = false
    } else if (price<=0) {
        document.getElementById("priceError").innerText = "Product price can't be a negative value or zero";
        productPrice = false
    } else {
        productPrice = true
        document.getElementById("priceError").innerText = "";
        updateSubmitButton();   
    }
}

function validateProductStock() {
    let price = document.getElementById("stock").value;
    if (!price) {
        document.getElementById("stockError").innerText = "Product stock is required";
        productStock = false
    } else if (price<=0) {
        document.getElementById("stockError").innerText = "Product stock can't be a negative value or zero";
        productStock = false
    } else {
        productStock = true
        document.getElementById("stockError").innerText = "";
        updateSubmitButton();    
    }
}










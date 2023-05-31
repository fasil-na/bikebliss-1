function validateProductName() {
    let name = document.getElementById("name").value.trim();
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!name) {
        document.getElementById("nameError").innerText = " Product name is required"
    } else if (!name.match(nameRegex)) {
        document.getElementById("nameError").innerText = "Product name can only contain letters and spaces"
    } else {
        document.getElementById("nameError").innerText = ""
        updateSubmitButton();
    }
}

function validateProductPrice() {
    let price = document.getElementById("price").value;
    if (!price) {
        document.getElementById("priceError").innerText = "Product price is required";
    } else if (price<=0) {
        document.getElementById("priceError").innerText = "Product price can't be a negative value or zero";
    } else {
        document.getElementById("priceError").innerText = "";
    }
}

function validateProductStock() {
    let price = document.getElementById("stock").value;
    if (!price) {
        document.getElementById("stockError").innerText = "Product stock is required";
    } else if (price<=0) {
        document.getElementById("stockError").innerText = "Product stock can't be a negative value or zero";
    } else {
        document.getElementById("stockError").innerText = "";
    }
}










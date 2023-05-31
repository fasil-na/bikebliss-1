function validateCategoryName() {
    let name = document.getElementById("name").value.trim();
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!name) {
        document.getElementById("nameError").innerText = "Category name is required"; 
    } else if (!name.match(nameRegex)) {
        document.getElementById("nameError").innerText = "Category name can only contain letters and spaces";
    } else if (name.length > 25) {
        document.getElementById("nameError").innerText = "Category name cannot exceed 25 characters";
    } else {
        document.getElementById("nameError").innerText = "";
    }
}













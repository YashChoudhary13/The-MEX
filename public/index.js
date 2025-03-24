// Get Elements
const menuTrigger = document.getElementById("menu-trigger"); // The clickable menu trigger (menu or cross icon)
const menuIcon = document.getElementById("menu-icon"); // Three lines icon
const closeIcon = document.getElementById("close-icon"); // Cross icon
const dropdownMenu = document.getElementById("dropdown-menu"); // Fullscreen dropdown menu
const body = document.body;

// Toggle Menu State
menuTrigger.addEventListener("click", () => {
    const isMenuOpen = body.classList.toggle("menu-open"); // Add or remove 'menu-open' class

    if (isMenuOpen) {
        dropdownMenu.style.display = "flex"; // Show dropdown menu
        menuIcon.style.display = "none"; // Hide the menu icon (three lines)
        closeIcon.style.display = "inline-block"; // Show the close icon (cross)
    } else {
        dropdownMenu.style.display = "none"; // Hide dropdown menu
        menuIcon.style.display = "inline-block"; // Show the menu icon
        closeIcon.style.display = "none"; // Hide the close icon
    }
});

// Close Dropdown When Clicking Outside the Menu
dropdownMenu.addEventListener("click", () => {
    dropdownMenu.style.display = "none"; // Hide dropdown menu
    body.classList.remove("menu-open"); // Remove 'menu-open' class
    menuIcon.style.display = "inline-block"; // Show the menu icon
    closeIcon.style.display = "none"; // Hide the close icon
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in and update menu visibility
    updateMenuVisibility();

    // Check if user is logged in and hide register button
    const token = localStorage.getItem('token');
    const registerBtn = document.querySelector('.register-btn');
    
    if (token && registerBtn) {
        registerBtn.style.display = 'none';
    }

    // Menu dropdown functionality
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    // Toggle dropdown menu when menu button is clicked
    menuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // Close dropdown when clicking on a menu item
    const dropdownLinks = dropdownMenu.querySelectorAll('a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function () {
            dropdownMenu.classList.remove('show');
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Close dropdown when pressing Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && dropdownMenu.classList.contains('show')) {
            dropdownMenu.classList.remove('show');
        }
    });
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Menu dropdown functionality
    const menuBtn = document.getElementById('languageBtn');
    const dropdownMenu = document.getElementById('languageDropdown');

    // Toggle dropdown menu when menu button is clicked
    menuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // Close dropdown when clicking on a menu item
    for (const link of dropdownMenu.children) {
        link.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default link behavior
            const selectedLang = link.getAttribute('value');
            window.localStorage.setItem('display-language', selectedLang)
            window.location.reload()
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Close dropdown when pressing Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && dropdownMenu.classList.contains('show')) {
            dropdownMenu.classList.remove('show');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const displayLanguage = window.localStorage.getItem("display-language")
    if (displayLanguage == null) {
        window.localStorage.setItem('display-language', 'en')
    }
    const elements = document.querySelectorAll('[data-lang]');
    elements.forEach(element => {
        const key = element.dataset.lang;
        element.textContent = key in tranlations[displayLanguage].main ? tranlations[displayLanguage].main[key] : tranlations['en'].main[key];
    })
})

document.addEventListener('DOMContentLoaded', function() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function() {
            window.location.href = 'main.html';
        });
        
        logo.style.cursor = 'pointer';
        logo.title = 'back to main page';
    }
});

// Function to handle menu visibility based on login status
function updateMenuVisibility() {
    const token = localStorage.getItem('token');
    const trainingLink = document.getElementById('trainingLink');
    const eventsLink = document.getElementById('eventsLink');
    const registerBtn = document.querySelector('.register-btn');
    
    if (token) {
        // User is logged in - show training button, change events link
        if (trainingLink) {
            trainingLink.style.display = 'block';
        }
        if (eventsLink) {
            eventsLink.href = 'viewEvent.html';
        }
        if (registerBtn) {
            registerBtn.style.display = 'none';
        }
    } else {
        // User is not logged in - hide training button, use default events link
        if (trainingLink) {
            trainingLink.style.display = 'none';
        }
        if (eventsLink) {
            eventsLink.href = 'eventIntroduction.html';
        }
        if (registerBtn) {
            registerBtn.style.display = 'block';
        }
    }
}
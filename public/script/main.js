// Yiru
document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in and update menu visibility
    updateMenuVisibility();
    // Setup font size selector
    setupFontSizeSelector();

    // Add logout button event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
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

// Function to handle menu visibility based on login status AND training status
function updateMenuVisibility() {
    const token = localStorage.getItem('token');
    const trainingLink = document.getElementById('trainingLink');
    const eventsLink = document.getElementById('eventsLink');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Check training status only if user is logged in
    const isTrained = token && localStorage.getItem('userTrained') === 'true';
    
    if (token) {
        // User is logged in - show training button, show logout button
        if (trainingLink) {
            trainingLink.style.display = 'block';
        }
        if (registerBtn) {
            registerBtn.style.display = 'none';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
        }
        
        // Update events link based on training status
        if (eventsLink) {
            eventsLink.href = isTrained ? 'viewEvent.html' : 'eventIntroduction.html';
        }
        
        // Also update any other events links in dropdown menus
        const allEventsLinks = document.querySelectorAll('a[href="eventIntroduction.html"], a[href="viewEvent.html"]');
        allEventsLinks.forEach(link => {
            if (link.textContent.includes('Event') || link.getAttribute('href').includes('event')) {
                link.href = isTrained ? 'viewEvent.html' : 'eventIntroduction.html';
            }
        });
    } else {
        // User is not logged in - hide training button, use default events link, show register button
        if (trainingLink) {
            trainingLink.style.display = 'none';
        }
        if (eventsLink) {
            eventsLink.href = 'eventIntroduction.html';
        }
        if (registerBtn) {
            registerBtn.style.display = 'block';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        
        // Reset all events links to introduction page for logged out users
        const allEventsLinks = document.querySelectorAll('a[href="eventIntroduction.html"], a[href="viewEvent.html"]');
        allEventsLinks.forEach(link => {
            if (link.textContent.includes('Event') || link.getAttribute('href').includes('event')) {
                link.href = 'eventIntroduction.html';
            }
        });
    }
}

// Function to handle logout
function handleLogout() {
    // Clear all stored user data
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    
    // Redirect to main page
    window.location.href = 'main.html';
}

// Add this function to handle font size changes
function setupFontSizeSelector() {
    const fontSizeBtn = document.getElementById('fontSizeBtn');
    const fontSizeDropdown = document.getElementById('fontSizeDropdown');
    const fontSizeIndicator = document.getElementById('fontSizeIndicator');
    
    // Exit if elements don't exist on this page
    if (!fontSizeBtn || !fontSizeDropdown) return;
    
    const fontSizeOptions = fontSizeDropdown.querySelectorAll('.font-size-option');
    
    // Load saved font size preference
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    applyFontSize(savedFontSize);
    updateFontSizeIndicator(savedFontSize);
    setActiveFontSizeOption(savedFontSize);
    
    // Toggle dropdown
    fontSizeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        fontSizeDropdown.classList.toggle('show');
    });
    
    // Handle font size selection
    fontSizeOptions.forEach(option => {
        option.addEventListener('click', function (e) {
            e.preventDefault();
            const selectedSize = this.getAttribute('data-size');
            applyFontSize(selectedSize);
            updateFontSizeIndicator(selectedSize);
            setActiveFontSizeOption(selectedSize);
            fontSizeDropdown.classList.remove('show');
            
            // Save preference
            localStorage.setItem('fontSize', selectedSize);
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!fontSizeBtn.contains(e.target) && !fontSizeDropdown.contains(e.target)) {
            fontSizeDropdown.classList.remove('show');
        }
    });
    
    // Close dropdown on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && fontSizeDropdown.classList.contains('show')) {
            fontSizeDropdown.classList.remove('show');
        }
    });
}

function applyFontSize(size) {
    // Remove all font size classes from html
    document.documentElement.classList.remove(
        'font-small-html', 
        'font-medium-html', 
        'font-large-html', 
        'font-xlarge-html'
    );
    
    // Add the selected class to html element
    switch(size) {
        case 'small':
            document.documentElement.classList.add('font-small-html');
            break;
        case 'medium':
            document.documentElement.classList.add('font-medium-html');
            break;
        case 'large':
            document.documentElement.classList.add('font-large-html');
            break;
        case 'xlarge':
            document.documentElement.classList.add('font-xlarge-html');
            break;
    }
    
    // Also apply to body for any direct body styles
    document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
    document.body.classList.add(`font-${size}`);
}

function updateFontSizeIndicator(size) {
    const indicator = document.getElementById('fontSizeIndicator');
    const sizeNames = {
        'small': 'Small',
        'medium': 'Medium',
        'large': 'Large',
        'xlarge': 'Extra Large'
    };
    indicator.textContent = sizeNames[size] || 'Medium';
}

function setActiveFontSizeOption(selectedSize) {
    const options = document.querySelectorAll('.font-size-option');
    options.forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-size') === selectedSize) {
            option.classList.add('active');
        }
    });
}
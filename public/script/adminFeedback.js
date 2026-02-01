// admin_feedback.js - FIREBASE CONNECTED VERSION
// ONLY READS FROM FIREBASE, NO LOGIN CHANGES


const YOUR_API_URL = 'http://localhost:3001/api/feedback';

// Override the DOMContentLoaded function
const originalOnLoad = function() {
};


document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ Loading feedback from YOUR backend...');
    
    // Check login
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (!token || role !== 'Admin') {
        alert('⚠️ Please login as admin first.');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // Load from backend
        const response = await fetch(YOUR_API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            currentData = await response.json(); // Override currentData
            console.log(`✅ Loaded ${currentData.length} items from YOUR backend`);
        } else {
            throw new Error('Server error: ' + response.status);
        }
        
    } catch (error) {
        console.log('❌ Using demo data:', error.message);
        // Keep existing demo data as fallback
    }
    
    // Call original initialization
    initFeedbackSystem();
});

// ====== CONFIGURATION ======
const USE_FIREBASE = true; // Set to false for demo mode
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBlN7borlIKXxly09JsFMC9nDKUcvA9bCM",
    authDomain: "cycling-without-age-grp9-cdb.firebaseapp.com",
    projectId: "cycling-without-age-grp9-cdb",
    storageBucket: "cycling-without-age-grp9-cdb.firebasestorage.app",
    messagingSenderId: "559083600036",
    appId: "1:559083600036:web:c0438122b8a56e59f7ce31",
    measurementId: "G-E2KF2YVL7R"
};

// ====== GLOBAL VARIABLES ======
let currentData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 5;
let filters = {
    date: '',
    status: 'all',
    type: 'all'
};

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ Admin Feedback System Loaded');
    
    // Check authentication (using THEIR system)
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    
    if (!token || userRole !== "Admin") {
        alert("⚠️ Admin access required. Please login as admin.");
        window.location.href = '/login.html';
        return;
    }
    
    console.log('👤 Logged in as:', localStorage.getItem("userName"));
    console.log('🔑 Token exists:', !!token);
    
    // Initialize
    setupEventListeners();
    
    // Try to load from Firebase first
    if (USE_FIREBASE) {
        try {
            await loadFeedbackFromFirebase();
            console.log('✅ Loaded from Firebase');
        } catch (error) {
            console.error('❌ Firebase error, using demo data:', error);
            await loadFallbackData();
        }
    } else {
        await loadFallbackData();
    }
    
    updateStats();
    renderFeedback();
});

// ====== FIREBASE FUNCTIONS ======
async function initializeFirebase() {
    // Dynamically load Firebase if not already loaded
    if (!window.firebase) {
        await loadScript('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
        await loadScript('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
    }
    
    if (!window.firebaseApp) {
        window.firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    }
    
    return window.firebaseApp;
}

async function loadFeedbackFromFirebase() {
    try {
        console.log('📥 Loading feedback from Firebase...');
        
        const app = await initializeFirebase();
        const db = firebase.firestore(app);
        
        // Get token from THEIR login system
        const token = localStorage.getItem("token");
        
        // Try to fetch via API first (their backend)
        const apiResponse = await fetch('/api/feedback', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (apiResponse.ok) {
            // Use their API if available
            currentData = await apiResponse.json();
            console.log(`✅ Loaded ${currentData.length} items via API`);
        } else {
            // Fallback: Direct Firestore access
            const feedbackRef = db.collection('feedback');
            const snapshot = await feedbackRef.orderBy('createdAt', 'desc').get();
            
            currentData = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                currentData.push({
                    id: doc.id,
                    name: data.name || 'Anonymous',
                    email: data.email || '',
                    message: data.message || '',
                    type: data.type || 'general',
                    rating: data.rating || 0,
                    status: data.status || 'new',
                    createdAt: data.createdAt?.toDate?.() || new Date()
                });
            });
            
            console.log(`✅ Loaded ${currentData.length} items from Firestore`);
        }
        
        // Apply filters
        applyFilters();
        
    } catch (error) {
        console.error('❌ Error loading from Firebase:', error);
        throw error; // Let caller handle fallback
    }
}

// ====== DEMO DATA (FALLBACK) ======
async function loadFallbackData() {
    console.log('📋 Using demo data (fallback mode)');
    
    // Your existing demo data
    const demoData = [
        {
            id: 1,
            name: "Mr. Tan Ah Beng",
            email: "tanahbeng@gmail.com",
            message: "My first trishaw ride last weekend brought tears to my eyes. I haven't felt so alive in years.",
            type: "senior",
            rating: 5,
            status: "new",
            createdAt: "2024-03-10T14:30:00Z"
        },
        {
            id: 2,
            name: "Sarah Lee",
            email: "sarah.lee@nus.edu.sg",
            message: "Volunteering for 6 months now. Most rewarding experience!",
            type: "volunteer",
            rating: 5,
            status: "new",
            createdAt: "2024-03-12T13:20:00Z"
        },
        {
            id: 3,
            name: "Mr. James Lim",
            email: "james.lim@limfoundation.org",
            message: "Our foundation donated $10,000. The impact report was very detailed.",
            type: "donor",
            rating: 5,
            status: "reviewed",
            createdAt: "2024-03-11T15:45:00Z"
        },
        {
            id: 4,
            name: "Visitor from Australia",
            email: "mark.davis@au.com",
            message: "Saw your program while visiting Singapore. What a brilliant initiative!",
            type: "general",
            rating: 5,
            status: "new",
            createdAt: "2024-03-10T12:15:00Z"
        },
        {
            id: 5,
            name: "Emma Chen",
            email: "emma.chen@outlook.com",
            message: "Love the program but communication needs improvement.",
            type: "volunteer",
            rating: 3,
            status: "reviewed",
            createdAt: "2024-03-08T14:25:00Z"
        }
    ];
    
    currentData = demoData;
    applyFilters();
}

// ====== UTILITY FUNCTIONS ======
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function setupEventListeners() {
    // Filter elements
    const filterDate = document.getElementById('filterDate');
    const filterStatus = document.getElementById('filterStatus');
    const filterType = document.getElementById('filterType');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const addDemoBtn = document.getElementById('addDemo');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');

    if (filterDate) filterDate.addEventListener('change', (e) => {
        filters.date = e.target.value;
    });
    
    if (filterStatus) filterStatus.addEventListener('change', (e) => {
        filters.status = e.target.value;
    });
    
    if (filterType) filterType.addEventListener('change', (e) => {
        filters.type = e.target.value;
    });
    
    if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', () => {
        applyFilters();
        renderFeedback();
    });
    
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => {
        clearFilters();
    });
    
    if (addDemoBtn) addDemoBtn.addEventListener('click', () => {
        addDemoFeedback();
    });
    
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => {
        prevPage();
    });
    
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => {
        nextPage();
    });
    
    // Tab functionality (add if you have tabs)
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filterType = this.dataset.filter;
            filters.type = filterType === 'all' ? 'all' : filterType;
            applyFilters();
            renderFeedback();
        });
    });
}

function applyFilters() {
    filteredData = currentData.filter(item => {
        // Date filter
        if (filters.date) {
            const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
            if (itemDate !== filters.date) return false;
        }
        
        // Status filter
        if (filters.status !== 'all' && item.status !== filters.status) {
            return false;
        }
        
        // Type filter
        if (filters.type !== 'all' && item.type !== filters.type) {
            return false;
        }
        
        return true;
    });
    
    currentPage = 1;
    updateShowingCount();
}

function clearFilters() {
    const filterDate = document.getElementById('filterDate');
    const filterStatus = document.getElementById('filterStatus');
    const filterType = document.getElementById('filterType');
    
    if (filterDate) filterDate.value = '';
    if (filterStatus) filterStatus.value = 'all';
    if (filterType) filterType.value = 'all';
    
    filters = { date: '', status: 'all', type: 'all' };
    applyFilters();
    renderFeedback();
}

function updateStats() {
    // Total feedback
    const totalEl = document.getElementById('totalFeedback');
    if (totalEl) totalEl.textContent = currentData.length;
    
    // New in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newCount = currentData.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= sevenDaysAgo && item.status === 'new';
    }).length;
    
    const newEl = document.getElementById('newFeedback');
    if (newEl) newEl.textContent = newCount;
    
    // Average rating
    const rated = currentData.filter(item => item.rating);
    const avg = rated.length > 0 
        ? (rated.reduce((sum, item) => sum + item.rating, 0) / rated.length).toFixed(1)
        : '0.0';
    
    const avgEl = document.getElementById('avgRating');
    if (avgEl) avgEl.textContent = avg;
}

function updateShowingCount() {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(start + itemsPerPage - 1, filteredData.length);
    const total = filteredData.length;
    
    const showingEl = document.getElementById('showingCount');
    const totalEl = document.getElementById('totalCount');
    
    if (showingEl) showingEl.textContent = `${start}-${end}`;
    if (totalEl) totalEl.textContent = total;
}

function renderFeedback() {
    const container = document.getElementById('feedbackList');
    const pagination = document.getElementById('pagination');
    
    if (!container) return;
    
    if (filteredData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 48px; margin-bottom: 20px;">📭</div>
                <h3>No feedback found</h3>
                <p>No feedback matches your current filters.</p>
                <button class="btn-secondary" onclick="clearFilters()">Clear Filters</button>
            </div>
        `;
        if (pagination) pagination.style.display = 'none';
        return;
    }
    
    // Calculate pagination
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentItems = filteredData.slice(start, end);
    
    // Update showing count
    updateShowingCount();
    
    // Generate HTML
    let html = '';
    currentItems.forEach(item => {
        const date = new Date(item.createdAt).toLocaleDateString('en-SG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Rating stars
        const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
        
        // Type labels
        const typeLabels = {
            volunteer: 'Volunteer',
            senior: 'Senior',
            donor: 'Donor',
            general: 'General'
        };
        
        const statusLabels = {
            new: 'New',
            reviewed: 'Reviewed',
            archived: 'Archived'
        };
        
        html += `
            <div class="feedback-item">
                <div class="feedback-header-row">
                    <div class="sender-info">
                        <div class="feedback-sender">${escapeHtml(item.name)}</div>
                        <div class="feedback-email">${escapeHtml(item.email)}</div>
                    </div>
                    <div class="feedback-meta">
                        <div class="feedback-date">${date}</div>
                        <div class="feedback-rating">${stars} (${item.rating}/5)</div>
                        <div class="feedback-tags">
                            <span class="tag type-${item.type}">${typeLabels[item.type]}</span>
                            <span class="tag status-${item.status}">${statusLabels[item.status]}</span>
                        </div>
                    </div>
                </div>
                <div class="feedback-content">
                    ${escapeHtml(item.message)}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    renderPagination();
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    
    if (!pagination || !prevBtn || !nextBtn) return;
    
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    
    if (currentPageEl) currentPageEl.textContent = currentPage;
    if (totalPagesEl) totalPagesEl.textContent = totalPages;
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderFeedback();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderFeedback();
    }
}

function addDemoFeedback() {
    alert('⚠️ Demo feedback feature disabled in Firebase mode.');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


window.clearFilters = clearFilters;
// admin_feedback.js
const MY_API_URL = 'http://localhost:3001/myapi/feedback';

document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ Admin Feedback System (Your Version)');
    
    // Check if user is logged in (using their system)
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    
    if (!userRole || userRole !== "Admin") {
        alert("⚠️ Admin access required.");
        window.location.href = '/login.html';
        return;
    }
    
    try {
        const response = await fetch(MY_API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            currentData = await response.json();
            console.log(`✅ Loaded ${currentData.length} items from YOUR server`);
        } else {
            throw new Error('Server returned ' + response.status);
        }
        
    } catch (error) {
        console.log('❌ Using demo data:', error.message);
        // Fallback to demo data
        currentData = getDemoData();
    }
    
    setupEventListeners();
    applyFilters();
    updateStats();
    renderFeedback();
});

function getDemoData() {
    return [
        {
            id: 1,
            name: "Mr. Tan Ah Beng",
            email: "tanahbeng@gmail.com",
            message: "My first trishaw ride last weekend brought tears to my eyes.",
            type: "senior",
            rating: 5,
            status: "new",
            createdAt: "2024-03-10T14:30:00Z"
        },
  
    ];
}


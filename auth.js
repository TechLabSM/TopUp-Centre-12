/* ========================================
   AUTHENTICATION & SESSION MANAGEMENT
======================================== */

/* ========================================
   SESSION MANAGEMENT
======================================== */

function saveSession(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

function loadSession() {
    const sessionData = sessionStorage.getItem('currentUser');
    if (sessionData) {
        currentUser = JSON.parse(sessionData);
        // Refresh user data from localStorage (in case balance changed)
        const freshUser = getUser(currentUser.username);
        if (freshUser) {
            currentUser = freshUser;
            saveSession(currentUser);
            updateBalancePill();
            renderAccountSection();
            return true;
        }
    }
    return false;
}

function clearSession() {
    sessionStorage.removeItem('currentUser');
    currentUser = null;
}

/* ========================================
   LOGIN HANDLER
======================================== */

function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Validation
    if (!username || !password) {
        showToast('Please enter username and password', 'error');
        return;
    }
    
    // Attempt login
    const result = loginUser(username, password);
    
    if (result.success) {
        currentUser = result.user;
        saveSession(currentUser);
        updateBalancePill();
        renderAccountSection();
        showToast('Login successful!', 'success');
        
        // Clear input fields
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    } else {
        showToast(result.message, 'error');
    }
}

/* ========================================
   REGISTRATION HANDLER
======================================== */

function handleRegister() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Validation
    if (!username || !password) {
        showToast('Please enter username and password', 'error');
        return;
    }
    
    if (username.length < 3) {
        showToast('Username must be at least 3 characters', 'error');
        return;
    }
    
    if (password.length < 4) {
        showToast('Password must be at least 4 characters', 'error');
        return;
    }
    
    // Check for special characters in username
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showToast('Username can only contain letters, numbers, and underscore', 'error');
        return;
    }
    
    // Attempt registration
    const result = addUser({ username, password });
    
    if (result.success) {
        showToast('Registration successful! Please login.', 'success');
        
        // Clear input fields
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    } else {
        showToast(result.message, 'error');
    }
}

/* ========================================
   LOGOUT HANDLER
======================================== */

function handleLogout() {
    showConfirm('Are you sure you want to logout?', () => {
        clearSession();
        updateBalancePill();
        renderAccountSection();
        showToast('Logged out successfully', 'success');
        
        // Hide admin panel if visible
        document.getElementById('admin-panel').style.display = 'none';
        
        // Go to home
        switchSection('home');
    });
}

/* ========================================
   ADMIN LOGIN HANDLER
======================================== */

function handleAdminLogin() {
    const pin = prompt('Enter Admin PIN:');
    
    if (!pin) return;
    
    if (checkAdminPin(pin)) {
        showToast('Admin access granted', 'success');
        renderAdminPanel();
        document.getElementById('admin-panel').style.display = 'block';
    } else {
        showToast('Invalid PIN', 'error');
    }
}

/* ========================================
   AUTO-LOGIN ON PAGE LOAD
======================================== */

// This will be called when page loads
function initAuth() {
    loadSession();
}

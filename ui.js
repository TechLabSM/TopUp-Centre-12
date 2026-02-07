/* ========================================
   UI RENDERING & DISPLAY LOGIC
======================================== */

// Global state
let currentUser = null;
let selectedGame = null;
let selectedPackage = null;

/* ========================================
   NAVIGATION & SECTION SWITCHING
======================================== */

function switchSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update bottom nav active state
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
        }
    });
    
    // Load section-specific content
    if (sectionName === 'home') {
        renderGames();
    } else if (sectionName === 'orders') {
        if (currentUser) {
            renderOrders(currentUser.username);
        } else {
            showToast('Please login first', 'error');
            switchSection('account');
        }
    } else if (sectionName === 'account') {
        renderAccountSection();
    } else if (sectionName === 'topup') {
        // Reset topup section
        document.getElementById('package-container').innerHTML = '';
        document.getElementById('checkout-container').style.display = 'none';
        showToast('Please select a game from Home', 'info');
        switchSection('home');
    } else if (sectionName === 'balance') {
        if (!currentUser) {
            showToast('Please login first', 'error');
            switchSection('account');
        }
    }
}

/* ========================================
   GAME RENDERING
======================================== */

function renderGames() {
    const container = document.getElementById('games-container');
    const games = getGames().filter(g => g.active);
    
    if (games.length === 0) {
        showEmptyState(container, 'No games available');
        return;
    }
    
    container.innerHTML = games.map(game => `
        <div class="game-card" onclick="selectGame(${game.id})">
            <img src="${game.logo || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect fill=\'%23E3F2FD\' width=\'100\' height=\'100\'/%3E%3Ctext x=\'50\' y=\'50\' text-anchor=\'middle\' dominant-baseline=\'middle\' font-size=\'40\' fill=\'%231E88E5\'%3E🎮%3C/text%3E%3C/svg%3E'}" 
                 alt="${game.name}" 
                 class="game-card-image"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect fill=\'%23E3F2FD\' width=\'100\' height=\'100\'/%3E%3Ctext x=\'50\' y=\'50\' text-anchor=\'middle\' dominant-baseline=\'middle\' font-size=\'40\' fill=\'%231E88E5\'%3E🎮%3C/text%3E%3C/svg%3E'">
            <div class="game-card-info">
                <div class="game-card-name">${game.name}</div>
                <div class="game-card-desc">${game.description}</div>
            </div>
        </div>
    `).join('');
}

function selectGame(gameId) {
    selectedGame = getGame(gameId);
    if (!selectedGame) {
        showToast('Game not found', 'error');
        return;
    }
    
    // Switch to topup section and show packages
    switchSection('topup');
    renderPackages(gameId);
}

/* ========================================
   PACKAGE RENDERING
======================================== */

function renderPackages(gameId) {
    const container = document.getElementById('package-container');
    const checkoutContainer = document.getElementById('checkout-container');
    const packages = getPackages(gameId);
    
    // Hide checkout form
    checkoutContainer.style.display = 'none';
    
    if (packages.length === 0) {
        showEmptyState(container, 'No packages available for this game');
        return;
    }
    
    container.innerHTML = packages.map(pkg => `
        <div class="package-card" onclick="selectPackage(${pkg.id})">
            <div class="package-name">${pkg.name}</div>
            <div class="package-price">৳ ${pkg.price}</div>
            <div class="package-type">${pkg.type}</div>
        </div>
    `).join('');
}

function selectPackage(packageId) {
    if (!currentUser) {
        showToast('Please login first', 'error');
        switchSection('account');
        return;
    }
    
    selectedPackage = getPackage(packageId);
    if (!selectedPackage) {
        showToast('Package not found', 'error');
        return;
    }
    
    renderCheckout();
}

/* ========================================
   CHECKOUT FORM RENDERING
======================================== */

function renderCheckout() {
    const container = document.getElementById('checkout-container');
    const settings = getSettings();
    
    let formFields = '';
    
    if (selectedPackage.type === 'UID') {
        formFields = `
            <input type="text" id="uid-input" class="input-field" placeholder="Enter Player UID" required>
        `;
    } else if (selectedPackage.type === 'ID/PASS') {
        formFields = `
            <input type="text" id="playerid-input" class="input-field" placeholder="Enter Player ID" required>
            <input type="password" id="playerpass-input" class="input-field" placeholder="Enter Password" required>
        `;
    }
    
    container.innerHTML = `
        <h3>Checkout</h3>
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Game:</span>
                <strong>${selectedGame.name}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Package:</span>
                <strong>${selectedPackage.name}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Price:</span>
                <strong style="color: #1E88E5;">৳ ${selectedPackage.price}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Your Balance:</span>
                <strong style="color: ${currentUser.balance >= selectedPackage.price ? '#4CAF50' : '#F44336'};">৳ ${currentUser.balance}</strong>
            </div>
        </div>
        ${formFields}
        <button class="btn-primary" onclick="processOrder()">Confirm Purchase</button>
        <button class="btn-telegram" onclick="openTelegram()">
            📱 Contact via Telegram
        </button>
        <button class="btn-secondary" onclick="cancelCheckout()">Cancel</button>
    `;
    
    container.style.display = 'block';
    
    // Hide package list
    document.getElementById('package-container').innerHTML = '';
}

function cancelCheckout() {
    selectedPackage = null;
    document.getElementById('checkout-container').style.display = 'none';
    renderPackages(selectedGame.id);
}

function processOrder() {
    if (!currentUser || !selectedPackage) return;
    
    // Validate balance
    if (currentUser.balance < selectedPackage.price) {
        showToast('Insufficient balance. Please add balance first.', 'error');
        return;
    }
    
    // Get form inputs
    let uid = '';
    let playerId = '';
    let password = '';
    
    if (selectedPackage.type === 'UID') {
        uid = document.getElementById('uid-input').value.trim();
        if (!uid) {
            showToast('Please enter Player UID', 'error');
            return;
        }
    } else if (selectedPackage.type === 'ID/PASS') {
        playerId = document.getElementById('playerid-input').value.trim();
        password = document.getElementById('playerpass-input').value.trim();
        if (!playerId || !password) {
            showToast('Please enter Player ID and Password', 'error');
            return;
        }
    }
    
    // Deduct balance
    const result = updateUserBalance(currentUser.username, -selectedPackage.price);
    if (!result.success) {
        showToast(result.message, 'error');
        return;
    }
    
    // Create order
    const orderData = {
        username: currentUser.username,
        gameId: selectedGame.id,
        gameName: selectedGame.name,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        price: selectedPackage.price,
        type: selectedPackage.type,
        uid: uid,
        playerId: playerId,
        password: password
    };
    
    const orderResult = addOrder(orderData);
    
    if (orderResult.success) {
        // Update current user balance
        currentUser.balance = result.balance;
        updateBalancePill();
        
        showToast('Order placed successfully!', 'success');
        
        // Reset and go to orders
        selectedPackage = null;
        selectedGame = null;
        switchSection('orders');
    } else {
        showToast('Order failed. Please try again.', 'error');
    }
}

function openTelegram() {
    const settings = getSettings();
    window.open(settings.telegram, '_blank');
}

/* ========================================
   ORDERS RENDERING
======================================== */

function renderOrders(username) {
    const container = document.getElementById('orders-container');
    const orders = getOrders(username);
    
    if (orders.length === 0) {
        showEmptyState(container, 'No orders yet');
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-card ${order.status.toLowerCase()}">
            <div class="order-header">
                <div class="order-game">${order.gameName}</div>
                <div class="order-status ${order.status.toLowerCase()}">${order.status}</div>
            </div>
            <div class="order-details">
                <div><strong>Package:</strong> ${order.packageName}</div>
                <div><strong>Price:</strong> ৳ ${order.price}</div>
                ${order.uid ? `<div><strong>UID:</strong> ${order.uid}</div>` : ''}
                ${order.playerId ? `<div><strong>Player ID:</strong> ${order.playerId}</div>` : ''}
            </div>
            <div class="order-date">${formatDate(order.createdAt)}</div>
        </div>
    `).join('');
}

/* ========================================
   BALANCE ADD FORM RENDERING
======================================== */

function renderBalanceForm(method) {
    if (!currentUser) {
        showToast('Please login first', 'error');
        switchSection('account');
        return;
    }
    
    const container = document.getElementById('balance-form-container');
    const settings = getSettings();
    const number = method === 'bkash' ? settings.bkashNumber : settings.nagadNumber;
    
    container.innerHTML = `
        <h3>Add Balance via ${method === 'bkash' ? 'bKash' : 'Nagad'}</h3>
        <div style="background: #E3F2FD; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
            <div style="font-size: 13px; color: #1565C0; margin-bottom: 8px;">
                <strong>Instructions:</strong>
            </div>
            <ol style="margin-left: 20px; font-size: 13px; color: #424242;">
                <li>Send money to: <strong>${number}</strong></li>
                <li>Fill the form below</li>
                <li>Wait for admin approval</li>
            </ol>
        </div>
        <input type="number" id="topup-amount" class="input-field" placeholder="Enter Amount (৳)" required>
        <input type="text" id="topup-txid" class="input-field" placeholder="Transaction ID" required>
        <input type="text" id="topup-from" class="input-field" placeholder="Your ${method === 'bkash' ? 'bKash' : 'Nagad'} Number" required>
        <button class="btn-primary" onclick="submitTopup('${method}')">Submit Request</button>
        <button class="btn-secondary" onclick="clearBalanceForm()">Cancel</button>
    `;
}

function clearBalanceForm() {
    document.getElementById('balance-form-container').innerHTML = '';
}

function submitTopup(method) {
    const amount = document.getElementById('topup-amount').value.trim();
    const txid = document.getElementById('topup-txid').value.trim();
    const fromNumber = document.getElementById('topup-from').value.trim();
    
    if (!amount || !txid || !fromNumber) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    if (parseFloat(amount) <= 0) {
        showToast('Amount must be greater than 0', 'error');
        return;
    }
    
    const topupData = {
        username: currentUser.username,
        method: method,
        amount: amount,
        transactionId: txid,
        fromNumber: fromNumber
    };
    
    const result = addTopup(topupData);
    
    if (result.success) {
        showToast('Top-up request submitted! Wait for approval.', 'success');
        clearBalanceForm();
    } else {
        showToast('Failed to submit request', 'error');
    }
}

/* ========================================
   ACCOUNT SECTION RENDERING
======================================== */

function renderAccountSection() {
    const authContainer = document.getElementById('auth-container');
    const accountDetails = document.getElementById('account-details');
    const adminPanel = document.getElementById('admin-panel');
    
    if (currentUser) {
        // User is logged in
        authContainer.style.display = 'none';
        accountDetails.style.display = 'block';
        
        document.getElementById('user-name').textContent = currentUser.username;
        document.getElementById('user-balance').textContent = '৳ ' + currentUser.balance;
    } else {
        // User not logged in
        authContainer.style.display = 'block';
        accountDetails.style.display = 'none';
        adminPanel.style.display = 'none';
    }
}

/* ========================================
   BALANCE PILL UPDATE
======================================== */

function updateBalancePill() {
    const balanceElement = document.querySelector('.balance-amount');
    if (currentUser) {
        balanceElement.textContent = currentUser.balance;
    } else {
        balanceElement.textContent = '0';
    }
}

/* ========================================
   TOAST NOTIFICATIONS
======================================== */

function showToast(message, type = 'info') {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 70px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#1E88E5'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animations to document
if (!document.querySelector('#toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
        @keyframes slideDown {
            from { transform: translate(-50%, -100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translate(-50%, 0); opacity: 1; }
            to { transform: translate(-50%, -100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

/* ========================================
   CONFIRM DIALOG
======================================== */

function showConfirm(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 320px;
        width: 100%;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    `;
    
    dialog.innerHTML = `
        <div style="font-size: 16px; margin-bottom: 20px; color: #212121;">${message}</div>
        <div style="display: flex; gap: 8px;">
            <button id="confirm-yes" class="btn-primary" style="flex: 1;">Yes</button>
            <button id="confirm-no" class="btn-secondary" style="flex: 1;">No</button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    document.getElementById('confirm-yes').onclick = () => {
        overlay.remove();
        onConfirm();
    };
    
    document.getElementById('confirm-no').onclick = () => {
        overlay.remove();
    };
}

/* ========================================
   EMPTY STATE
======================================== */

function showEmptyState(container, message) {
    container.innerHTML = `
        <div class="empty-state">
            <svg viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <div>${message}</div>
        </div>
    `;
}

/* ========================================
   UPDATE APP LOGO & NAME
======================================== */

function updateAppLogo() {
    const settings = getSettings();
    const logoImg = document.querySelector('.app-logo');
    const appName = document.querySelector('.app-name');
    
    if (settings.logo) {
        logoImg.src = settings.logo;
        logoImg.style.display = 'block';
    } else {
        logoImg.style.display = 'none';
    }
    
    appName.textContent = settings.appName;
    document.title = settings.appName;
}

// Initialize on load
updateAppLogo();

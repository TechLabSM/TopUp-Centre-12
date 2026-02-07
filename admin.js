/* ========================================
   ADMIN PANEL MANAGEMENT
======================================== */

let currentAdminTab = 'games';

/* ========================================
   MAIN ADMIN PANEL RENDERER
======================================== */

function renderAdminPanel() {
    const panel = document.getElementById('admin-panel');
    
    panel.innerHTML = `
        <h3 style="margin-bottom: 16px; color: #212121;">🔐 Admin Panel</h3>
        <div class="admin-tabs">
            <button class="admin-tab active" onclick="switchAdminTab('games')">Games</button>
            <button class="admin-tab" onclick="switchAdminTab('packages')">Packages</button>
            <button class="admin-tab" onclick="switchAdminTab('orders')">Orders</button>
            <button class="admin-tab" onclick="switchAdminTab('topups')">Top-ups</button>
            <button class="admin-tab" onclick="switchAdminTab('settings')">Settings</button>
            <button class="admin-tab" onclick="switchAdminTab('users')">Users</button>
        </div>
        <div id="admin-content" style="margin-top: 20px;"></div>
    `;
    
    renderGamesTab();
}

function switchAdminTab(tabName) {
    currentAdminTab = tabName;
    
    // Update active tab
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Render tab content
    switch(tabName) {
        case 'games': renderGamesTab(); break;
        case 'packages': renderPackagesTab(); break;
        case 'orders': renderOrdersTab(); break;
        case 'topups': renderTopupsTab(); break;
        case 'settings': renderSettingsTab(); break;
        case 'users': renderUsersTab(); break;
    }
}

/* ========================================
   GAMES TAB
======================================== */

function renderGamesTab() {
    const content = document.getElementById('admin-content');
    const games = getGames();
    
    content.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h4>Add New Game</h4>
            <input type="text" id="new-game-name" class="input-field" placeholder="Game Name">
            <input type="text" id="new-game-desc" class="input-field" placeholder="Description">
            <input type="file" id="new-game-logo" class="input-field" accept="image/*">
            <button class="btn-primary" onclick="addNewGame()">Add Game</button>
        </div>
        
        <h4>Existing Games</h4>
        <div class="games-list">
            ${games.map(game => `
                <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #1E88E5;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600;">${game.name}</div>
                            <div style="font-size: 12px; color: #757575;">${game.description}</div>
                            <div style="font-size: 11px; color: #9E9E9E; margin-top: 4px;">Status: ${game.active ? 'Active' : 'Inactive'}</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-secondary" style="padding: 8px 12px;" onclick="editGame(${game.id})">Edit</button>
                            <button class="btn-danger" style="padding: 8px 12px;" onclick="deleteGameAdmin(${game.id})">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function addNewGame() {
    const name = document.getElementById('new-game-name').value.trim();
    const desc = document.getElementById('new-game-desc').value.trim();
    const logoFile = document.getElementById('new-game-logo').files[0];
    
    if (!name || !desc) {
        showToast('Please fill game name and description', 'error');
        return;
    }
    
    const processGame = (logoData) => {
        const result = addGame({
            name: name,
            description: desc,
            logo: logoData || ''
        });
        
        if (result.success) {
            showToast('Game added successfully!', 'success');
            renderGamesTab();
        } else {
            showToast('Failed to add game', 'error');
        }
    };
    
    if (logoFile) {
        convertImageToBase64(logoFile, processGame);
    } else {
        processGame('');
    }
}

function editGame(id) {
    const game = getGame(id);
    const name = prompt('Game Name:', game.name);
    if (!name) return;
    
    const desc = prompt('Description:', game.description);
    if (!desc) return;
    
    updateGame(id, { name, description: desc });
    showToast('Game updated!', 'success');
    renderGamesTab();
}

function deleteGameAdmin(id) {
    showConfirm('Delete this game and all its packages?', () => {
        deleteGame(id);
        showToast('Game deleted!', 'success');
        renderGamesTab();
    });
}

/* ========================================
   PACKAGES TAB
======================================== */

function renderPackagesTab() {
    const content = document.getElementById('admin-content');
    const games = getGames();
    const packages = getPackages();
    
    content.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h4>Add New Package</h4>
            <select id="new-package-game" class="input-field">
                <option value="">Select Game</option>
                ${games.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
            </select>
            <input type="text" id="new-package-name" class="input-field" placeholder="Package Name">
            <input type="number" id="new-package-price" class="input-field" placeholder="Price (৳)">
            <select id="new-package-type" class="input-field">
                <option value="UID">UID</option>
                <option value="ID/PASS">ID/PASS</option>
            </select>
            <button class="btn-primary" onclick="addNewPackage()">Add Package</button>
        </div>
        
        <h4>Existing Packages</h4>
        <div class="packages-list">
            ${packages.map(pkg => {
                const game = getGame(pkg.gameId);
                return `
                <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #FF9800;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600;">${pkg.name}</div>
                            <div style="font-size: 12px; color: #757575;">Game: ${game ? game.name : 'Unknown'}</div>
                            <div style="font-size: 14px; color: #1E88E5; font-weight: 600;">৳ ${pkg.price}</div>
                            <span style="background: #E3F2FD; color: #1565C0; padding: 2px 8px; border-radius: 12px; font-size: 10px;">${pkg.type}</span>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-secondary" style="padding: 8px 12px;" onclick="editPackage(${pkg.id})">Edit</button>
                            <button class="btn-danger" style="padding: 8px 12px;" onclick="deletePackageAdmin(${pkg.id})">Delete</button>
                        </div>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
}

function addNewPackage() {
    const gameId = document.getElementById('new-package-game').value;
    const name = document.getElementById('new-package-name').value.trim();
    const price = document.getElementById('new-package-price').value;
    const type = document.getElementById('new-package-type').value;
    
    if (!gameId || !name || !price) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    addPackage({
        gameId: parseInt(gameId),
        name: name,
        price: parseFloat(price),
        type: type
    });
    
    showToast('Package added successfully!', 'success');
    renderPackagesTab();
}

function editPackage(id) {
    const pkg = getPackage(id);
    const name = prompt('Package Name:', pkg.name);
    if (!name) return;
    
    const price = prompt('Price:', pkg.price);
    if (!price) return;
    
    updatePackage(id, { name, price: parseFloat(price) });
    showToast('Package updated!', 'success');
    renderPackagesTab();
}

function deletePackageAdmin(id) {
    showConfirm('Delete this package?', () => {
        deletePackage(id);
        showToast('Package deleted!', 'success');
        renderPackagesTab();
    });
}

/* ========================================
   ORDERS TAB
======================================== */

function renderOrdersTab() {
    const content = document.getElementById('admin-content');
    const orders = getOrders();
    
    content.innerHTML = `
        <h4>All Orders</h4>
        <div class="orders-admin-list">
            ${orders.length === 0 ? '<div style="color: #9E9E9E; text-align: center; padding: 40px;">No orders yet</div>' :
            orders.map(order => `
                <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid ${
                    order.status === 'Pending' ? '#FF9800' :
                    order.status === 'Processing' ? '#2196F3' :
                    order.status === 'Completed' ? '#4CAF50' : '#F44336'
                };">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                        <div>
                            <div style="font-weight: 600; font-size: 16px;">${order.gameName}</div>
                            <div style="color: #757575;">Package: ${order.packageName}</div>
                            <div style="color: #1E88E5; font-weight: 600;">৳ ${order.price}</div>
                        </div>
                        <select class="input-field" style="width: 140px; padding: 8px;" onchange="updateOrderStatusAdmin(${order.id}, this.value)">
                            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                            <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                            <option value="Rejected" ${order.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                    </div>
                    <div style="font-size: 13px; color: #616161; line-height: 1.6;">
                        <div><strong>User:</strong> ${order.username}</div>
                        ${order.uid ? `<div><strong>UID:</strong> ${order.uid}</div>` : ''}
                        ${order.playerId ? `<div><strong>Player ID:</strong> ${order.playerId}</div>` : ''}
                        ${order.password ? `<div><strong>Password:</strong> ${order.password}</div>` : ''}
                        <div><strong>Date:</strong> ${formatDate(order.createdAt)}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function updateOrderStatusAdmin(orderId, newStatus) {
    const result = updateOrderStatus(orderId, newStatus);
    if (result.success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        if (newStatus === 'Rejected') {
            showToast('Balance refunded to user', 'info');
        }
    } else {
        showToast('Failed to update order', 'error');
    }
}

/* ========================================
   TOP-UPS TAB
======================================== */

function renderTopupsTab() {
    const content = document.getElementById('admin-content');
    const topups = getTopups();
    
    content.innerHTML = `
        <h4>Balance Top-up Requests</h4>
        <div class="topups-list">
            ${topups.length === 0 ? '<div style="color: #9E9E9E; text-align: center; padding: 40px;">No top-up requests</div>' :
            topups.map(topup => `
                <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid ${
                    topup.status === 'Pending' ? '#FF9800' :
                    topup.status === 'Approved' ? '#4CAF50' : '#F44336'
                };">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600;">৳ ${topup.amount}</div>
                            <div style="font-size: 13px; color: #757575; margin-top: 4px;">
                                <div><strong>User:</strong> ${topup.username}</div>
                                <div><strong>Method:</strong> ${topup.method}</div>
                                <div><strong>TxID:</strong> ${topup.transactionId}</div>
                                <div><strong>From:</strong> ${topup.fromNumber}</div>
                                <div><strong>Date:</strong> ${formatDate(topup.createdAt)}</div>
                            </div>
                        </div>
                        <div>
                            ${topup.status === 'Pending' ? `
                                <button class="btn-primary" style="padding: 8px 12px; margin-bottom: 8px;" onclick="approveTopup(${topup.id})">Approve</button>
                                <button class="btn-danger" style="padding: 8px 12px;" onclick="rejectTopup(${topup.id})">Reject</button>
                            ` : `
                                <span style="background: ${topup.status === 'Approved' ? '#E8F5E9' : '#FFEBEE'}; 
                                             color: ${topup.status === 'Approved' ? '#2E7D32' : '#C62828'};
                                             padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                    ${topup.status}
                                </span>
                            `}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function approveTopup(id) {
    showConfirm('Approve this top-up request?', () => {
        const result = updateTopupStatus(id, 'Approved');
        if (result.success) {
            showToast('Top-up approved! Balance added to user.', 'success');
            renderTopupsTab();
        }
    });
}

function rejectTopup(id) {
    showConfirm('Reject this top-up request?', () => {
        const result = updateTopupStatus(id, 'Rejected');
        if (result.success) {
            showToast('Top-up rejected!', 'success');
            renderTopupsTab();
        }
    });
}

/* ========================================
   SETTINGS TAB
======================================== */

function renderSettingsTab() {
    const content = document.getElementById('admin-content');
    const settings = getSettings();
    
    content.innerHTML = `
        <h4>App Settings</h4>
        <div style="background: white; padding: 20px; border-radius: 8px;">
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: #616161; font-size: 13px;">App Name</label>
                <input type="text" id="setting-appname" class="input-field" value="${settings.appName}">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: #616161; font-size: 13px;">App Logo</label>
                <input type="file" id="setting-logo" class="input-field" accept="image/*">
                ${settings.logo ? '<div style="margin-top: 8px; font-size: 12px; color: #4CAF50;">✓ Logo uploaded</div>' : ''}
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: #616161; font-size: 13px;">Telegram Link</label>
                <input type="text" id="setting-telegram" class="input-field" value="${settings.telegram}">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: #616161; font-size: 13px;">bKash Number</label>
                <input type="text" id="setting-bkash" class="input-field" value="${settings.bkashNumber}">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: #616161; font-size: 13px;">Nagad Number</label>
                <input type="text" id="setting-nagad" class="input-field" value="${settings.nagadNumber}">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: #616161; font-size: 13px;">New Admin PIN (leave empty to keep current)</label>
                <input type="password" id="setting-pin" class="input-field" placeholder="Enter new PIN">
            </div>
            
            <button class="btn-primary" onclick="saveSettings()">Save Settings</button>
        </div>
    `;
}

function saveSettings() {
    const appName = document.getElementById('setting-appname').value.trim();
    const telegram = document.getElementById('setting-telegram').value.trim();
    const bkash = document.getElementById('setting-bkash').value.trim();
    const nagad = document.getElementById('setting-nagad').value.trim();
    const newPin = document.getElementById('setting-pin').value.trim();
    const logoFile = document.getElementById('setting-logo').files[0];
    
    const saveData = () => {
        const settings = getSettings();
        
        updateSettings({
            appName: appName || settings.appName,
            telegram: telegram || settings.telegram,
            bkashNumber: bkash || settings.bkashNumber,
            nagadNumber: nagad || settings.nagadNumber
        });
        
        if (newPin) {
            updateAdminPin(newPin);
            showToast('Admin PIN updated!', 'info');
        }
        
        updateAppLogo();
        showToast('Settings saved successfully!', 'success');
        renderSettingsTab();
    };
    
    if (logoFile) {
        convertImageToBase64(logoFile, (logoData) => {
            updateSettings({ logo: logoData });
            saveData();
        });
    } else {
        saveData();
    }
}

/* ========================================
   USERS TAB
======================================== */

function renderUsersTab() {
    const content = document.getElementById('admin-content');
    const users = getUsers();
    
    content.innerHTML = `
        <h4>All Users (${users.length})</h4>
        <div class="users-list">
            ${users.length === 0 ? '<div style="color: #9E9E9E; text-align: center; padding: 40px;">No users registered</div>' :
            users.map(user => `
                <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #9C27B0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; font-size: 16px; color: #212121;">👤 ${user.username}</div>
                            <div style="font-size: 13px; color: #616161; margin-top: 8px; line-height: 1.6;">
                                <div><strong>Password:</strong> <span style="font-family: monospace; background: #F5F5F5; padding: 2px 6px; border-radius: 4px;">${user.password}</span></div>
                                <div><strong>Balance:</strong> <span style="color: #1E88E5; font-weight: 600;">৳ ${user.balance}</span></div>
                                <div><strong>Joined:</strong> ${formatDate(user.createdAt)}</div>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <button class="btn-primary" style="padding: 8px 12px;" onclick="editUserBalanceAdmin('${user.username}')">Edit Balance</button>
                            <button class="btn-danger" style="padding: 8px 12px;" onclick="deleteUserAdmin('${user.username}')">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function editUserBalanceAdmin(username) {
    const user = getUser(username);
    if (!user) {
        showToast('User not found', 'error');
        return;
    }
    
    const action = prompt(`Current balance: ৳ ${user.balance}\n\nEnter action:\n1 = Set new balance\n2 = Add amount\n3 = Deduct amount`);
    
    if (!action) return;
    
    switch(action) {
        case '1':
            const newBalance = prompt('Enter new balance:');
            if (newBalance && !isNaN(newBalance)) {
                const difference = parseFloat(newBalance) - user.balance;
                updateUserBalance(username, difference);
                showToast(`Balance set to ৳ ${newBalance}`, 'success');
                renderUsersTab();
                
                // Update current user if editing self
                if (currentUser && currentUser.username === username) {
                    currentUser.balance = parseFloat(newBalance);
                    updateBalancePill();
                }
            }
            break;
            
        case '2':
            const addAmount = prompt('Enter amount to add:');
            if (addAmount && !isNaN(addAmount) && parseFloat(addAmount) > 0) {
                updateUserBalance(username, parseFloat(addAmount));
                showToast(`Added ৳ ${addAmount} to ${username}`, 'success');
                renderUsersTab();
                
                // Update current user if editing self
                if (currentUser && currentUser.username === username) {
                    currentUser.balance += parseFloat(addAmount);
                    updateBalancePill();
                }
            }
            break;
            
        case '3':
            const deductAmount = prompt('Enter amount to deduct:');
            if (deductAmount && !isNaN(deductAmount) && parseFloat(deductAmount) > 0) {
                if (user.balance >= parseFloat(deductAmount)) {
                    updateUserBalance(username, -parseFloat(deductAmount));
                    showToast(`Deducted ৳ ${deductAmount} from ${username}`, 'success');
                    renderUsersTab();
                    
                    // Update current user if editing self
                    if (currentUser && currentUser.username === username) {
                        currentUser.balance -= parseFloat(deductAmount);
                        updateBalancePill();
                    }
                } else {
                    showToast('Insufficient balance for deduction', 'error');
                }
            }
            break;
            
        default:
            showToast('Invalid action', 'error');
    }
}

function deleteUserAdmin(username) {
    if (currentUser && currentUser.username === username) {
        showToast('Cannot delete currently logged-in user', 'error');
        return;
    }
    
    showConfirm(`Delete user "${username}" permanently?`, () => {
        const users = getUsers();
        const filtered = users.filter(u => u.username !== username);
        localStorage.setItem('users', JSON.stringify(filtered));
        
        // Also delete user's orders
        const orders = JSON.parse(localStorage.getItem('orders'));
        const filteredOrders = orders.filter(o => o.username !== username);
        localStorage.setItem('orders', JSON.stringify(filteredOrders));
        
        // Also delete user's topups
        const topups = JSON.parse(localStorage.getItem('topups'));
        const filteredTopups = topups.filter(t => t.username !== username);
        localStorage.setItem('topups', JSON.stringify(filteredTopups));
        
        showToast(`User "${username}" deleted!`, 'success');
        renderUsersTab();
    });
}

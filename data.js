/* ========================================
   DATA MANAGEMENT - localStorage Operations
======================================== */

// Initialize default data on first load
function initData() {
    // Initialize admin credentials (default PIN: 1234)
    if (!localStorage.getItem('admin')) {
        localStorage.setItem('admin', JSON.stringify({
            pin: '1234'
        }));
    }

    // Initialize settings
    if (!localStorage.getItem('settings')) {
        localStorage.setItem('settings', JSON.stringify({
            appName: 'TopUp Centre',
            logo: '',
            telegram: 'https://t.me/yourusername',
            bkashNumber: '01XXXXXXXXX',
            nagadNumber: '01XXXXXXXXX'
        }));
    }

    // Initialize users array
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }

    // Initialize games array with sample data
    if (!localStorage.getItem('games')) {
        const sampleGames = [
            {
                id: Date.now() + 1,
                name: 'Free Fire',
                description: 'Buy diamonds instantly',
                logo: '',
                active: true
            },
            {
                id: Date.now() + 2,
                name: 'PUBG Mobile',
                description: 'Get UC fast delivery',
                logo: '',
                active: true
            },
            {
                id: Date.now() + 3,
                name: 'Mobile Legends',
                description: 'Diamond top-up service',
                logo: '',
                active: true
            },
            {
                id: Date.now() + 4,
                name: 'Call of Duty',
                description: 'CP top-up available',
                logo: '',
                active: true
            }
        ];
        localStorage.setItem('games', JSON.stringify(sampleGames));
    }

    // Initialize packages array with sample data
    if (!localStorage.getItem('packages')) {
        const games = getGames();
        const samplePackages = [];
        
        games.forEach(game => {
            if (game.name === 'Free Fire') {
                samplePackages.push(
                    { id: Date.now() + 101, gameId: game.id, name: '100 Diamonds', price: 120, type: 'UID' },
                    { id: Date.now() + 102, gameId: game.id, name: '310 Diamonds', price: 350, type: 'UID' },
                    { id: Date.now() + 103, gameId: game.id, name: '520 Diamonds', price: 580, type: 'UID' }
                );
            } else if (game.name === 'PUBG Mobile') {
                samplePackages.push(
                    { id: Date.now() + 201, gameId: game.id, name: '60 UC', price: 100, type: 'ID/PASS' },
                    { id: Date.now() + 202, gameId: game.id, name: '325 UC', price: 500, type: 'ID/PASS' },
                    { id: Date.now() + 203, gameId: game.id, name: '660 UC', price: 1000, type: 'ID/PASS' }
                );
            }
        });
        
        localStorage.setItem('packages', JSON.stringify(samplePackages));
    }

    // Initialize orders array
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }

    // Initialize topups array
    if (!localStorage.getItem('topups')) {
        localStorage.setItem('topups', JSON.stringify([]));
    }
}

/* ========================================
   SETTINGS OPERATIONS
======================================== */

function getSettings() {
    return JSON.parse(localStorage.getItem('settings'));
}

function updateSettings(newSettings) {
    const settings = getSettings();
    const updated = { ...settings, ...newSettings };
    localStorage.setItem('settings', JSON.stringify(updated));
    return updated;
}

/* ========================================
   ADMIN OPERATIONS
======================================== */

function checkAdminPin(pin) {
    const admin = JSON.parse(localStorage.getItem('admin'));
    return admin.pin === pin;
}

function updateAdminPin(newPin) {
    localStorage.setItem('admin', JSON.stringify({ pin: newPin }));
}

/* ========================================
   USER OPERATIONS
======================================== */

function getUsers() {
    return JSON.parse(localStorage.getItem('users'));
}

function getUser(username) {
    const users = getUsers();
    return users.find(u => u.username === username);
}

function addUser(user) {
    const users = getUsers();
    
    // Check if username exists
    if (users.find(u => u.username === user.username)) {
        return { success: false, message: 'Username already exists' };
    }
    
    const newUser = {
        username: user.username,
        password: user.password,
        balance: 0,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, user: newUser };
}

function updateUserBalance(username, amount) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex === -1) {
        return { success: false, message: 'User not found' };
    }
    
    users[userIndex].balance += amount;
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, balance: users[userIndex].balance };
}

function loginUser(username, password) {
    const user = getUser(username);
    
    if (!user) {
        return { success: false, message: 'User not found' };
    }
    
    if (user.password !== password) {
        return { success: false, message: 'Incorrect password' };
    }
    
    return { success: true, user: user };
}

/* ========================================
   GAME OPERATIONS
======================================== */

function getGames() {
    return JSON.parse(localStorage.getItem('games'));
}

function getGame(id) {
    const games = getGames();
    return games.find(g => g.id === id);
}

function addGame(game) {
    const games = getGames();
    const newGame = {
        id: Date.now(),
        name: game.name,
        description: game.description,
        logo: game.logo || '',
        active: true
    };
    
    games.push(newGame);
    localStorage.setItem('games', JSON.stringify(games));
    return { success: true, game: newGame };
}

function updateGame(id, updatedData) {
    const games = getGames();
    const index = games.findIndex(g => g.id === id);
    
    if (index === -1) {
        return { success: false, message: 'Game not found' };
    }
    
    games[index] = { ...games[index], ...updatedData };
    localStorage.setItem('games', JSON.stringify(games));
    return { success: true, game: games[index] };
}

function deleteGame(id) {
    const games = getGames();
    const filtered = games.filter(g => g.id !== id);
    localStorage.setItem('games', JSON.stringify(filtered));
    
    // Also delete associated packages
    const packages = getPackages();
    const filteredPackages = packages.filter(p => p.gameId !== id);
    localStorage.setItem('packages', JSON.stringify(filteredPackages));
    
    return { success: true };
}

/* ========================================
   PACKAGE OPERATIONS
======================================== */

function getPackages(gameId = null) {
    const packages = JSON.parse(localStorage.getItem('packages'));
    if (gameId) {
        return packages.filter(p => p.gameId === gameId);
    }
    return packages;
}

function getPackage(id) {
    const packages = getPackages();
    return packages.find(p => p.id === id);
}

function addPackage(packageData) {
    const packages = getPackages();
    const newPackage = {
        id: Date.now(),
        gameId: packageData.gameId,
        name: packageData.name,
        price: parseFloat(packageData.price),
        type: packageData.type // 'UID' or 'ID/PASS'
    };
    
    packages.push(newPackage);
    localStorage.setItem('packages', JSON.stringify(packages));
    return { success: true, package: newPackage };
}

function updatePackage(id, updatedData) {
    const packages = getPackages();
    const index = packages.findIndex(p => p.id === id);
    
    if (index === -1) {
        return { success: false, message: 'Package not found' };
    }
    
    packages[index] = { ...packages[index], ...updatedData };
    localStorage.setItem('packages', JSON.stringify(packages));
    return { success: true, package: packages[index] };
}

function deletePackage(id) {
    const packages = getPackages();
    const filtered = packages.filter(p => p.id !== id);
    localStorage.setItem('packages', JSON.stringify(filtered));
    return { success: true };
}

/* ========================================
   ORDER OPERATIONS
======================================== */

function getOrders(username = null) {
    const orders = JSON.parse(localStorage.getItem('orders'));
    if (username) {
        return orders.filter(o => o.username === username).reverse();
    }
    return orders.reverse();
}

function getOrder(id) {
    const orders = JSON.parse(localStorage.getItem('orders'));
    return orders.find(o => o.id === id);
}

function addOrder(orderData) {
    const orders = JSON.parse(localStorage.getItem('orders'));
    const newOrder = {
        id: Date.now(),
        username: orderData.username,
        gameId: orderData.gameId,
        gameName: orderData.gameName,
        packageId: orderData.packageId,
        packageName: orderData.packageName,
        price: orderData.price,
        type: orderData.type,
        uid: orderData.uid || '',
        playerId: orderData.playerId || '',
        password: orderData.password || '',
        status: 'Pending', // Pending, Processing, Completed, Rejected
        createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    return { success: true, order: newOrder };
}

function updateOrderStatus(id, status) {
    const orders = JSON.parse(localStorage.getItem('orders'));
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) {
        return { success: false, message: 'Order not found' };
    }
    
    orders[index].status = status;
    orders[index].updatedAt = new Date().toISOString();
    
    // If rejected, refund the user
    if (status === 'Rejected') {
        updateUserBalance(orders[index].username, orders[index].price);
    }
    
    localStorage.setItem('orders', JSON.stringify(orders));
    return { success: true, order: orders[index] };
}

/* ========================================
   TOP-UP (BALANCE ADD) OPERATIONS
======================================== */

function getTopups(status = null) {
    const topups = JSON.parse(localStorage.getItem('topups'));
    if (status) {
        return topups.filter(t => t.status === status).reverse();
    }
    return topups.reverse();
}

function getTopup(id) {
    const topups = JSON.parse(localStorage.getItem('topups'));
    return topups.find(t => t.id === id);
}

function addTopup(topupData) {
    const topups = JSON.parse(localStorage.getItem('topups'));
    const newTopup = {
        id: Date.now(),
        username: topupData.username,
        method: topupData.method, // bkash or nagad
        amount: parseFloat(topupData.amount),
        transactionId: topupData.transactionId,
        fromNumber: topupData.fromNumber,
        status: 'Pending', // Pending, Approved, Rejected
        createdAt: new Date().toISOString()
    };
    
    topups.push(newTopup);
    localStorage.setItem('topups', JSON.stringify(topups));
    return { success: true, topup: newTopup };
}

function updateTopupStatus(id, status) {
    const topups = JSON.parse(localStorage.getItem('topups'));
    const index = topups.findIndex(t => t.id === id);
    
    if (index === -1) {
        return { success: false, message: 'Top-up not found' };
    }
    
    const topup = topups[index];
    topup.status = status;
    topup.updatedAt = new Date().toISOString();
    
    // If approved, add balance to user
    if (status === 'Approved') {
        updateUserBalance(topup.username, topup.amount);
    }
    
    localStorage.setItem('topups', JSON.stringify(topups));
    return { success: true, topup: topup };
}

/* ========================================
   UTILITY FUNCTIONS
======================================== */

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function convertImageToBase64(file, callback) {
    const reader = new FileReader();
    reader.onloadend = function() {
        callback(reader.result);
    };
    reader.readAsDataURL(file);
}

// Initialize data on load
initData();

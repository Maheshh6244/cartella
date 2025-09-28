// Products data - will be fetched from API
let products = [];

// Cart data
let cart = [];

// User data
let currentUser = null;
let authToken = null;

// API Base URL - will be proxied through nginx
const API_BASE = '/api';

// DOM elements
const productsGrid = document.getElementById('products-grid');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.querySelector('.cart-count');
const accountLink = document.getElementById('account-link');
const cartLink = document.getElementById('cart-link');
const checkoutBtn = document.getElementById('checkout-btn');
const accountModal = document.getElementById('account-modal');
const cartModal = document.getElementById('cart-modal');
const checkoutModal = document.getElementById('checkout-modal');
const closeButtons = document.querySelectorAll('.close');
const tabLinks = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCartFromStorage();
    updateCartCount();
    
    // Check if user is logged in
    checkAuthStatus();
    
    // Event listeners for modals
    accountLink.addEventListener('click', function(e) {
        e.preventDefault();
        accountModal.style.display = 'block';
    });
    
    cartLink.addEventListener('click', function(e) {
        e.preventDefault();
        updateCartModal();
        cartModal.style.display = 'block';
    });
    
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        if (!currentUser) {
            alert('Please login to proceed to checkout');
            accountModal.style.display = 'block';
            return;
        }
        
        cartModal.style.display = 'none';
        checkoutModal.style.display = 'block';
    });
    
    // Close modals when clicking the X
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            accountModal.style.display = 'none';
            cartModal.style.display = 'none';
            checkoutModal.style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === accountModal) {
            accountModal.style.display = 'none';
        }
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (e.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
    });
    
    // Tab functionality for account modal
    tabLinks.forEach(link => {
        link.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabLinks.forEach(tab => tab.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current tab and content
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Form submissions
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        const password = this.querySelector('input[type="password"]').value;
        loginUser(email, password);
    });
    
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const password = this.querySelector('input[type="password"]').value;
        registerUser(name, email, password);
    });
    
    document.getElementById('checkout-form').addEventListener('submit', function(e) {
        e.preventDefault();
        processCheckout();
    });
});

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        products = await response.json();
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to default products if API fails
        products = getDefaultProducts();
        displayProducts();
    }
}

// Get default products (fallback)
function getDefaultProducts() {
    return [
        {
            id: 1,
            name: "Wireless Bluetooth Headphones",
            price: 79.99,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            description: "High-quality wireless headphones with noise cancellation"
        },
        {
            id: 2,
            name: "Smartphone 128GB",
            price: 699.99,
            image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
            description: "Latest smartphone with advanced camera and fast processor"
        },
        {
            id: 3,
            name: "Laptop 15-inch",
            price: 999.99,
            image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
            description: "Powerful laptop for work and entertainment"
        },
        {
            id: 4,
            name: "Smart Watch",
            price: 199.99,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1399&q=80",
            description: "Feature-rich smartwatch with health monitoring"
        },
        {
            id: 5,
            name: "Digital Camera",
            price: 549.99,
            image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            description: "Professional digital camera for stunning photos"
        },
        {
            id: 6,
            name: "Gaming Console",
            price: 399.99,
            image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            description: "Next-gen gaming console for immersive gameplay"
        }
    ];
}

// Display products on the homepage
function displayProducts() {
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // Add event listeners to "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        updateCartCount();
        saveCartToStorage();
        showAddedToCartMessage(product.name);
        
        // Sync with backend if user is logged in
        if (currentUser) {
            syncCartWithBackend();
        }
    }
}

// Sync cart with backend
async function syncCartWithBackend() {
    if (!currentUser) return;
    
    try {
        for (const item of cart) {
            await fetch(`${API_BASE}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken
                },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    product_id: item.id,
                    quantity: item.quantity
                })
            });
        }
    } catch (error) {
        console.error('Error syncing cart with backend:', error);
    }
}

// Show message when product is added to cart
function showAddedToCartMessage(productName) {
    const message = document.createElement('div');
    message.className = 'added-to-cart-message';
    message.innerHTML = `
        <div style="position: fixed; bottom: 20px; right: 20px; background: #232f3e; color: white; padding: 15px; border-radius: 4px; z-index: 1001; display: flex; align-items: center;">
            <i class="fas fa-check-circle" style="margin-right: 10px;"></i> ${productName} added to cart!
        </div>
    `;
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Update cart count in the header
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Update cart modal with current cart items
function updateCartModal() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item" data-id="${item.id}">Remove</button>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = total.toFixed(2);
    
    // Add event listeners for quantity changes and removal
    const decreaseButtons = document.querySelectorAll('.decrease');
    const increaseButtons = document.querySelectorAll('.increase');
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const removeButtons = document.querySelectorAll('.remove-item');
    
    decreaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            updateQuantity(productId, -1);
        });
    });
    
    increaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            updateQuantity(productId, 1);
        });
    });
    
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const newQuantity = parseInt(this.value);
            
            if (newQuantity < 1) {
                this.value = 1;
                updateQuantity(productId, 0, 1);
            } else {
                updateQuantity(productId, 0, newQuantity);
            }
        });
    });
    
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromCart(productId);
        });
    });
}

// Update item quantity in cart
function updateQuantity(productId, change, newQuantity = null) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (newQuantity !== null) {
            item.quantity = newQuantity;
        } else {
            item.quantity += change;
        }
        
        if (item.quantity < 1) {
            removeFromCart(productId);
        } else {
            updateCartCount();
            updateCartModal();
            saveCartToStorage();
            
            // Sync with backend if user is logged in
            if (currentUser) {
                syncCartWithBackend();
            }
        }
    }
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    updateCartModal();
    saveCartToStorage();
    
    // Sync with backend if user is logged in
    if (currentUser) {
        removeFromBackendCart(productId);
    }
}

// Remove item from backend cart
async function removeFromBackendCart(productId) {
    if (!currentUser) return;
    
    try {
        await fetch(`${API_BASE}/cart?user_id=${currentUser.id}&product_id=${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authToken
            }
        });
    } catch (error) {
        console.error('Error removing item from backend cart:', error);
    }
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('cartella_cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cartella_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// User authentication functions
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            authToken = data.token;
            
            // Save auth data
            localStorage.setItem('cartella_user', JSON.stringify(currentUser));
            localStorage.setItem('cartella_token', authToken);
            
            // Update UI
            accountLink.textContent = `Hello, ${currentUser.name}`;
            accountModal.style.display = 'none';
            
            // Sync cart with backend
            syncCartWithBackend();
            
            alert('Login successful!');
        } else {
            alert('Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

async function registerUser(name, email, password) {
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            // Switch to login tab
            document.querySelector('[data-tab="login"]').click();
            // Pre-fill email
            document.querySelector('#login input[type="email"]').value = email;
        } else {
            const error = await response.json();
            alert(`Registration failed: ${error.message}`);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

function checkAuthStatus() {
    const savedUser = localStorage.getItem('cartella_user');
    const savedToken = localStorage.getItem('cartella_token');
    
    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        authToken = savedToken;
        accountLink.textContent = `Hello, ${currentUser.name}`;
    }
}

// Checkout process
async function processCheckout() {
    if (!currentUser) {
        alert('Please login to complete your order.');
        return;
    }
    
    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    
    try {
        const shippingInfo = {
            name: document.querySelector('#checkout-form input[placeholder="Full Name"]').value,
            address: document.querySelector('#checkout-form input[placeholder="Address"]').value,
            city: document.querySelector('#checkout-form input[placeholder="City"]').value,
            postalCode: document.querySelector('#checkout-form input[placeholder="Postal Code"]').value,
            country: document.querySelector('#checkout-form input[placeholder="Country"]').value
        };
        
        const paymentInfo = {
            method: 'Credit Card',
            cardNumber: document.querySelector('#checkout-form input[placeholder="Card Number"]').value
        };
        
        const response = await fetch(`${API_BASE}/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                cart_items: cart,
                shipping_info: shippingInfo,
                payment_info: paymentInfo
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`Order placed successfully! Order ID: ${result.order_id}`);
            
            // Clear cart
            cart = [];
            updateCartCount();
            saveCartToStorage();
            
            // Clear backend cart
            if (currentUser) {
                await fetch(`${API_BASE}/cart/clear?user_id=${currentUser.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': authToken
                    }
                });
            }
            
            checkoutModal.style.display = 'none';
        } else {
            alert('Checkout failed. Please try again.');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Checkout failed. Please try again.');
    }
}

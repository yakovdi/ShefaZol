// order.js - Customer order form functionality with custom products only
import db from '../database.js';

// DOM Elements
const orderForm = document.getElementById('orderForm');
const productsList = document.getElementById('productsList');
const orderSummary = document.getElementById('orderSummary');
const addProductBtn = document.getElementById('addProductBtn');
const addProductModal = document.getElementById('addProductModal');
const addProductForm = document.getElementById('addProductForm');
const orderConfirmation = document.getElementById('orderConfirmation');
const printOrderBtn = document.getElementById('printOrderBtn');
const newOrderBtn = document.getElementById('newOrderBtn');
const customerAddressInput = document.getElementById('customerAddress');
const cancelAddProductBtn = document.getElementById('cancelAddProduct');
const closeModalX = document.getElementById('closeModalX');

// Global variables
let selectedProducts = [];
let lastOrderData = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initGooglePlaces();
    initializeEmptyProductsList();
    setupEventListeners();
    setMinDeliveryDate();
});

// Set minimum delivery date to tomorrow
function setMinDeliveryDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    document.getElementById('deliveryDate').min = formattedDate;
    document.getElementById('deliveryDate').value = formattedDate;
}

// Initialize Google Places Autocomplete
async function initGooglePlaces() {
    try {
        // Import the places module
        const placesModule = await import('./places.js');
        
        // Initialize Google Places integration
        placesModule.default.init();
    } catch (error) {
        console.error('Error initializing Google Places:', error);
    }
}

// Initialize empty products list
function initializeEmptyProductsList() {
    productsList.innerHTML = `
        <div class="empty-products-message">
            <p>אין מוצרים ברשימה. לחץ על "הוסף מוצר" כדי להתחיל את ההזמנה שלך.</p>
        </div>
        <div class="products-container" id="productsContainer"></div>
    `;
    
    updateOrderSummary();
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    orderForm.addEventListener('submit', handleOrderSubmit);
    
    // Add product button
    addProductBtn.addEventListener('click', function() {
        addProductModal.classList.remove('hidden');
    });
    
    // Add product form
    addProductForm.addEventListener('submit', handleAddProduct);
    
    // Close modal with X button
    if (closeModalX) {
        closeModalX.addEventListener('click', function() {
            addProductModal.classList.add('hidden');
        });
    }
    
    // Close modal with Cancel button
    if (cancelAddProductBtn) {
        cancelAddProductBtn.addEventListener('click', function() {
            addProductModal.classList.add('hidden');
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === addProductModal) {
            addProductModal.classList.add('hidden');
        }
    });
    
    // Print order button
    printOrderBtn.addEventListener('click', printOrder);
    
    // New order button
    newOrderBtn.addEventListener('click', function() {
        orderConfirmation.classList.add('hidden');
        orderForm.reset();
        selectedProducts = [];
        initializeEmptyProductsList();
        setMinDeliveryDate();
    });
}

// Handle adding custom product
function handleAddProduct(e) {
    e.preventDefault();
    
    const productName = document.getElementById('productName').value;
    const quantity = parseInt(document.getElementById('productQuantity').value);
    
    if (productName && quantity > 0) {
        const customProduct = {
            id: 'custom_' + Date.now(),
            name: productName
        };
        
        // Add to selected products
        selectedProducts.push({
            productId: customProduct.id,
            productName: customProduct.name,
            quantity: quantity
        });
        
        // Update UI
        updateProductsList();
        updateOrderSummary();
        
        // Reset and close modal
        document.getElementById('productName').value = '';
        document.getElementById('productQuantity').value = 1;
        addProductModal.classList.add('hidden');
    }
}

// Update products list in UI
function updateProductsList() {
    const productsContainer = document.getElementById('productsContainer');
    
    // Remove empty message if it exists
    const emptyMessage = document.querySelector('.empty-products-message');
    if (emptyMessage) {
        emptyMessage.style.display = 'none';
    }
    
    // Clear current list
    productsContainer.innerHTML = '';
    
    // Add each product to the list
    selectedProducts.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <div class="product-details">
                <span class="product-name">${product.productName}</span>
            </div>
            <div class="product-quantity">
                <button type="button" class="quantity-btn decrease" data-id="${product.productId}">-</button>
                <span class="quantity">${product.quantity}</span>
                <button type="button" class="quantity-btn increase" data-id="${product.productId}">+</button>
                <button type="button" class="remove-btn" data-id="${product.productId}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        productsContainer.appendChild(productItem);
    });
    
    // Add event listeners for quantity buttons
    document.querySelectorAll('.increase').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            increaseProductQuantity(productId);
        });
    });
    
    document.querySelectorAll('.decrease').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            decreaseProductQuantity(productId);
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            removeProduct(productId);
        });
    });
}

// Increase product quantity
function increaseProductQuantity(productId) {
    const product = selectedProducts.find(p => p.productId === productId);
    
    if (product) {
        product.quantity += 1;
        updateProductsList();
        updateOrderSummary();
    }
}

// Decrease product quantity
function decreaseProductQuantity(productId) {
    const index = selectedProducts.findIndex(p => p.productId === productId);
    
    if (index !== -1) {
        if (selectedProducts[index].quantity > 1) {
            selectedProducts[index].quantity -= 1;
        } else {
            selectedProducts.splice(index, 1);
        }
        
        updateProductsList();
        updateOrderSummary();
        
        // Show empty message if no products
        if (selectedProducts.length === 0) {
            const emptyMessage = document.querySelector('.empty-products-message');
            if (emptyMessage) {
                emptyMessage.style.display = 'block';
            }
        }
    }
}

// Remove product completely
function removeProduct(productId) {
    const index = selectedProducts.findIndex(p => p.productId === productId);
    
    if (index !== -1) {
        selectedProducts.splice(index, 1);
        updateProductsList();
        updateOrderSummary();
        
        // Show empty message if no products
        if (selectedProducts.length === 0) {
            const emptyMessage = document.querySelector('.empty-products-message');
            if (emptyMessage) {
                emptyMessage.style.display = 'block';
            }
        }
    }
}

// Update order summary
function updateOrderSummary() {
    if (selectedProducts.length === 0) {
        orderSummary.innerHTML = '<p>לא נבחרו מוצרים</p>';
        return;
    }
    
    let summaryHTML = '<ul class="summary-list">';
    
    selectedProducts.forEach(product => {
        summaryHTML += `
            <li>
                <span>${product.productName}</span>
                <span>כמות: ${product.quantity}</span>
            </li>
        `;
    });
    
    summaryHTML += '</ul>';
    orderSummary.innerHTML = summaryHTML;
}

// Handle order submission
async function handleOrderSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!await validateForm()) {
        return;
    }
    
    // Get form data
    const formData = new FormData(orderForm);
    
    // Get address data from Places module
    let addressData = formData.get('customerAddress');
    try {
        const placesModule = await import('./places.js');
        const placeDetails = placesModule.default.getAddressData();
        if (placeDetails) {
            addressData = placeDetails.formatted_address || addressData;
        }
    } catch (error) {
        console.error('Error getting address data:', error);
    }
    
    const orderData = {
        customerName: formData.get('customerName'),
        customerPhone: formData.get('customerPhone'),
        customerEmail: formData.get('customerEmail') || null,
        customerAddress: addressData,
        customerNumber: formData.get('customerNumber') || null,
        deliveryDate: formData.get('deliveryDate'),
        deliveryType: formData.get('deliveryType'),
        notes: formData.get('notes') || null,
        items: selectedProducts
    };
    
    // Validate products
    if (selectedProducts.length === 0) {
        alert('יש לבחור לפחות מוצר אחד');
        return;
    }
    
    try {
        // Save order to database
        const savedOrder = await db.addOrder(orderData);
        
        // Save order items
        await db.addOrderItems(savedOrder.id, selectedProducts);
        
        // Save last order data for printing
        lastOrderData = {
            ...savedOrder,
            items: selectedProducts
        };
        
        // Send notifications
        sendOrderNotifications(lastOrderData);
        
        // Show confirmation
        orderConfirmation.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('אירעה שגיאה בשליחת ההזמנה. אנא נסה שוב מאוחר יותר.');
    }
}

// Validate form
async function validateForm() {
    const requiredFields = ['customerName', 'customerPhone', 'deliveryDate'];
    
    for (const field of requiredFields) {
        const input = document.getElementById(field);
        if (!input.value.trim()) {
            alert(`אנא מלא את השדה: ${input.previousElementSibling.textContent.replace('*', '')}`);
            input.focus();
            return false;
        }
    }
    
    // Validate phone number
    const phoneInput = document.getElementById('customerPhone');
    const phoneRegex = /^0[2-9]\d{7,8}$/;
    if (!phoneRegex.test(phoneInput.value)) {
        alert('מספר טלפון לא תקין');
        phoneInput.focus();
        return false;
    }
    
    // Validate address using Places module
    try {
        const placesModule = await import('./places.js');
        const isAddressValid = placesModule.default.validate();
        
        if (!isAddressValid) {
            // The places module will show its own error message
            document.getElementById('customerAddress').focus();
            return false;
        }
    } catch (error) {
        console.error('Error validating address:', error);
        // Fallback validation if places module fails
        const addressInput = document.getElementById('customerAddress');
        if (!addressInput.value.trim()) {
            alert('אנא הזן כתובת');
            addressInput.focus();
            return false;
        }
    }
    
    return true;
}

// Send order notifications
async function sendOrderNotifications(orderData) {
    try {
        // Import notifications module
        const notificationsModule = await import('./notifications.js');
        
        // Get settings
        const settings = await db.getSettings();
        
        // Send notifications
        await notificationsModule.default.sendNotifications(orderData, settings);
        
        console.log('Notifications sent successfully');
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
}

// Print order
async function printOrder() {
    if (!lastOrderData) {
        alert('אין נתוני הזמנה להדפסה');
        return;
    }
    
    try {
        // Import notifications module
        const notificationsModule = await import('./notifications.js');
        
        // Generate PDF
        await notificationsModule.default.generatePDF(lastOrderData);
    } catch (error) {
        console.error('Error printing order:', error);
        alert('אירעה שגיאה בהדפסת ההזמנה. נסה שוב מאוחר יותר.');
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
}

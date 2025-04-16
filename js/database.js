// database.js - Database interface for Shefa-Zol ordering system
// This module provides a unified interface for data storage using LocalStorage
// with the option to upgrade to Firebase in the future

const db = {
    // Settings
    getSettings: async function() {
        const settings = localStorage.getItem('shefazol_settings');
        return settings ? JSON.parse(settings) : {
            adminEmail: 'admin@shefazol.com',
            orderNotificationText: 'תודה על הזמנתך בשפע-זול! פרטי ההזמנה:',
            businessHours: 'א-ה: 8:00-20:00, ו: 8:00-14:00'
        };
    },
    
    saveSettings: async function(settings) {
        localStorage.setItem('shefazol_settings', JSON.stringify(settings));
        return settings;
    },
    
    // Orders
    getOrders: async function() {
        const orders = localStorage.getItem('shefazol_orders');
        return orders ? JSON.parse(orders) : [];
    },
    
    getOrderById: async function(orderId) {
        const orders = await this.getOrders();
        return orders.find(order => order.id === orderId);
    },
    
    addOrder: async function(orderData) {
        const orders = await this.getOrders();
        const newOrder = {
            id: 'order_' + Date.now(),
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        orders.push(newOrder);
        localStorage.setItem('shefazol_orders', JSON.stringify(orders));
        return newOrder;
    },
    
    updateOrderStatus: async function(orderId, status) {
        const orders = await this.getOrders();
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = status;
            orders[orderIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('shefazol_orders', JSON.stringify(orders));
            return orders[orderIndex];
        }
        
        return null;
    },
    
    // Order Items
    addOrderItems: async function(orderId, items) {
        const orders = await this.getOrders();
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].items = items;
            localStorage.setItem('shefazol_orders', JSON.stringify(orders));
            return orders[orderIndex];
        }
        
        return null;
    },
    
    // Products (not used in the updated version where customers add their own products)
    getActiveProducts: async function() {
        // This function is kept for backward compatibility
        // In the updated version, we don't load predefined products
        return [];
    },
    
    addProduct: async function(product) {
        // This function is kept for backward compatibility
        // In the updated version, we don't manage products in the database
        return {
            id: 'product_' + Date.now(),
            ...product
        };
    }
};

export default db;

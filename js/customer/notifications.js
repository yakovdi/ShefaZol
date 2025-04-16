// notifications.js - Handles order notifications and PDF generation
const notificationsModule = {
    // Send notifications for new order
    sendNotifications: async function(orderData, settings) {
        try {
            // Send email notification
            await this.sendEmailNotification(orderData, settings);
            
            // Send WhatsApp notification
            await this.sendWhatsAppNotification(orderData, settings);
            
            return true;
        } catch (error) {
            console.error('Error sending notifications:', error);
            return false;
        }
    },
    
    // Send email notification
    sendEmailNotification: async function(orderData, settings) {
        try {
            // Initialize EmailJS
            emailjs.init("YOUR_EMAILJS_USER_ID");
            
            // Prepare order items text
            let itemsText = '';
            orderData.items.forEach(item => {
                itemsText += `${item.productName}: ${item.quantity}\n`;
            });
            
            // Prepare email parameters
            const emailParams = {
                to_email: settings.adminEmail,
                to_name: 'מנהל שפע-זול',
                customer_name: orderData.customerName,
                customer_phone: orderData.customerPhone,
                customer_email: orderData.customerEmail || 'לא צוין',
                customer_address: orderData.customerAddress,
                delivery_date: new Date(orderData.deliveryDate).toLocaleDateString('he-IL'),
                delivery_type: orderData.deliveryType === 'delivery' ? 'משלוח' : 'איסוף עצמי',
                order_items: itemsText,
                notes: orderData.notes || 'אין הערות'
            };
            
            // Send email to admin
            await emailjs.send("default_service", "order_notification", emailParams);
            
            // Send email to customer if email provided
            if (orderData.customerEmail) {
                emailParams.to_email = orderData.customerEmail;
                emailParams.to_name = orderData.customerName;
                await emailjs.send("default_service", "customer_confirmation", emailParams);
            }
            
            return true;
        } catch (error) {
            console.error('Error sending email notification:', error);
            return false;
        }
    },
    
    // Send WhatsApp notification
    sendWhatsAppNotification: async function(orderData, settings) {
        try {
            // Prepare order items text
            let itemsText = '';
            orderData.items.forEach(item => {
                itemsText += `${item.productName}: ${item.quantity}\n`;
            });
            
            // Prepare WhatsApp message
            const message = `${settings.orderNotificationText}\n\n` +
                `שם: ${orderData.customerName}\n` +
                `טלפון: ${orderData.customerPhone}\n` +
                `כתובת: ${orderData.customerAddress}\n` +
                `תאריך משלוח: ${new Date(orderData.deliveryDate).toLocaleDateString('he-IL')}\n` +
                `סוג משלוח: ${orderData.deliveryType === 'delivery' ? 'משלוח' : 'איסוף עצמי'}\n\n` +
                `פריטים:\n${itemsText}\n` +
                `הערות: ${orderData.notes || 'אין הערות'}`;
            
            // Encode message for WhatsApp URL
            const encodedMessage = encodeURIComponent(message);
            
            // Create WhatsApp URL
            const whatsappUrl = `https://wa.me/${orderData.customerPhone.replace(/^0/, '972')}?text=${encodedMessage}`;
            
            // Open WhatsApp link in new window
            window.open(whatsappUrl, '_blank');
            
            return true;
        } catch (error) {
            console.error('Error sending WhatsApp notification:', error);
            return false;
        }
    },
    
    // Generate PDF for order
    generatePDF: async function(orderData) {
        try {
            // Create PDF content
            const pdfContent = document.createElement('div');
            pdfContent.className = 'pdf-content';
            pdfContent.innerHTML = `
                <div class="pdf-header">
                    <h1>שפע-זול - פרטי הזמנה</h1>
                    <p>מספר הזמנה: ${orderData.id}</p>
                    <p>תאריך: ${new Date(orderData.createdAt).toLocaleDateString('he-IL')}</p>
                </div>
                <div class="pdf-customer">
                    <h2>פרטי לקוח</h2>
                    <p><strong>שם:</strong> ${orderData.customerName}</p>
                    <p><strong>טלפון:</strong> ${orderData.customerPhone}</p>
                    <p><strong>כתובת:</strong> ${orderData.customerAddress}</p>
                    ${orderData.customerEmail ? `<p><strong>דוא"ל:</strong> ${orderData.customerEmail}</p>` : ''}
                    ${orderData.customerNumber ? `<p><strong>מספר לקוח:</strong> ${orderData.customerNumber}</p>` : ''}
                </div>
                <div class="pdf-order">
                    <h2>פרטי הזמנה</h2>
                    <p><strong>תאריך משלוח:</strong> ${new Date(orderData.deliveryDate).toLocaleDateString('he-IL')}</p>
                    <p><strong>סוג משלוח:</strong> ${orderData.deliveryType === 'delivery' ? 'משלוח' : 'איסוף עצמי'}</p>
                    ${orderData.notes ? `<p><strong>הערות:</strong> ${orderData.notes}</p>` : ''}
                </div>
                <div class="pdf-items">
                    <h2>פריטים</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>מוצר</th>
                                <th>כמות</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orderData.items.map(item => `
                                <tr>
                                    <td>${item.productName}</td>
                                    <td>${item.quantity}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="pdf-footer">
                    <p>תודה שקנית בשפע-זול!</p>
                </div>
            `;
            
            // Add PDF styles
            const style = document.createElement('style');
            style.textContent = `
                .pdf-content {
                    font-family: Arial, sans-serif;
                    direction: rtl;
                    padding: 20px;
                }
                .pdf-header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 10px;
                }
                .pdf-customer, .pdf-order, .pdf-items {
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: right;
                }
                th {
                    background-color: #f2f2f2;
                }
                .pdf-footer {
                    margin-top: 30px;
                    text-align: center;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
            `;
            pdfContent.appendChild(style);
            
            // Generate PDF
            const opt = {
                margin: 10,
                filename: `שפע-זול_הזמנה_${orderData.id}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            // Add to document temporarily
            document.body.appendChild(pdfContent);
            
            // Generate and download PDF
            await html2pdf().from(pdfContent).set(opt).save();
            
            // Remove from document
            document.body.removeChild(pdfContent);
            
            return true;
        } catch (error) {
            console.error('Error generating PDF:', error);
            return false;
        }
    }
};

export default notificationsModule;

// Show Medicine Time Notification
function showMedicineNotification(schedule) {
    const notification = document.createElement('div');
    notification.className = 'notification reminder';
    notification.innerHTML = `
        <i class="fas fa-clock"></i>
        <div class="notification-content">
            <div class="notification-title">${schedule.greeting}</div>
            <div class="notification-message">
                ${schedule.message}<br>
                • ${schedule.medicines.join('<br>• ')}
            </div>
        </div>
        <div class="notification-close">
            <i class="fas fa-times"></i>
        </div>
    `;
    
    showNotificationBox(notification);

    // Send mobile notification
    const notificationMessage = `${schedule.message}\n• ${schedule.medicines.join('\n• ')}`;
    sendMobileNotification(schedule.greeting, notificationMessage);
}

// Show Alert Notification (Refill/Expiry)
function showAlertNotification(title, message) {
    const notification = document.createElement('div');
    notification.className = 'notification urgent';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-close">
            <i class="fas fa-times"></i>
        </div>
    `;
    
    showNotificationBox(notification);

    // Send mobile notification
    sendMobileNotification(title, message);
}

// Helper function to handle notification display
function showNotificationBox(notification) {
    const container = document.getElementById('notificationContainer');
    container.appendChild(notification);

    // Add close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.5s ease-out';
        setTimeout(() => notification.remove(), 500);
    });

    // Auto remove after 30 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.5s ease-out';
            setTimeout(() => notification.remove(), 500);
        }
    }, 30000);
}

// Function to send mobile notification
async function sendMobileNotification(title, message) {
    try {
        await OneSignal.sendSelfNotification(
            title,
            message,
            null,
            null
        );
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Medicine Stock Data
const medicineStock = [
    { name: 'Metformin', total: 10, lowStockThreshold: 15 },
    { name: 'Vitamin D3', total: 5, lowStockThreshold: 10 },
    { name: 'Calcium', total: 8, lowStockThreshold: 10 },
    { name: 'Multivitamin', total: 12, lowStockThreshold: 15 }
];

// Medicine Schedule
const medicineSchedule = {
    morning: {
        time: '08:00',
        greeting: 'Good morning Pallavi! Rise and shine!',
        message: 'Start your day right with your morning medicines:',
        medicines: ['Metformin - 500mg', 'Vitamin D3']
    },
    afternoon: {
        time: '14:00',
        greeting: 'Hey Pallavi! Hope you are having a good day!',
        message: 'Time for your afternoon medicines:',
        medicines: ['Calcium']
    },
    night: {
        time: '21:00',
        greeting: 'Good evening Pallavi! Before you wind down...',
        message: 'Do not forget your night medicines:',
        medicines: ['Metformin - 500mg', 'Multivitamin']
    }
};

// Medicine Expiry Data
const medicineExpiry = [
    { name: 'Calcium', expiryDate: '2025-05-07' },
    { name: 'Multivitamin', expiryDate: '2025-05-22' }
];

// Function to check and display expiring medicines
function displayExpiringMedicines() {
    const expiringSection = document.getElementById('expiringMedicines');
    if (!expiringSection) return;

    const content = expiringSection.querySelector('.alert-content');
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const expiringMeds = medicineExpiry.filter(med => {
        const expiryDate = new Date(med.expiryDate);
        return expiryDate <= thirtyDaysFromNow;
    });

    if (expiringMeds.length === 0) {
        content.innerHTML = '<div class="no-alerts">No medicines expiring soon</div>';
        return;
    }

    content.innerHTML = expiringMeds.map(med => {
        const daysUntilExpiry = Math.ceil((new Date(med.expiryDate) - now) / (1000 * 60 * 60 * 24));
        return `
            <div class="alert-item">
                <span class="medicine-name">${med.name}</span>
                <span class="alert-info">Expires in ${daysUntilExpiry} days</span>
            </div>
        `;
    }).join('');
}

// Function to check and display low stock medicines
function displayLowStockMedicines() {
    const lowStockSection = document.getElementById('lowStockMedicines');
    if (!lowStockSection) return;

    const content = lowStockSection.querySelector('.alert-content');
    const lowStockMeds = medicineStock.filter(med => med.total <= med.lowStockThreshold);

    if (lowStockMeds.length === 0) {
        content.innerHTML = '<div class="no-alerts">All medicines are well stocked</div>';
        return;
    }

    content.innerHTML = lowStockMeds.map(med => {
        return `
            <div class="alert-item">
                <span class="medicine-name">${med.name}</span>
                <span class="alert-info">${med.total} left</span>
            </div>
        `;
    }).join('');
}

// Initialize alerts on page load
document.addEventListener('DOMContentLoaded', () => {
    displayExpiringMedicines();
    displayLowStockMedicines();
});

// Check Time and Show Notifications
function checkScheduleAndNotify() {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    // Check medicine schedule
    Object.entries(medicineSchedule).forEach(([period, schedule]) => {
        if (currentTime === schedule.time) {
            showMedicineNotification(schedule);
        }
    });

    // Check medicine stock and expiry
    medicineStock.forEach(medicine => {
        // Check stock level
        if (medicine.total <= medicine.lowStockThreshold) {
            showAlertNotification(
                'Medicine Alert',
                `Hi Pallavi! Your ${medicine.name} is running low. Only ${medicine.total} tablets left. Please refill soon!`
            );
        }

        // Check expiry for this medicine
        const expiryInfo = medicineExpiry.find(med => med.name === medicine.name);
        if (expiryInfo) {
            const expiryDate = new Date(expiryInfo.expiryDate);
            const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

            if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
                showAlertNotification(
                    'Medicine Alert',
                    `Hi Pallavi! Your ${medicine.name} will expire in ${daysUntilExpiry} days. Please plan to get a refill.`
                );
            }
        }
    });
}

// Check schedule every minute
setInterval(checkScheduleAndNotify, 60000);

// Initial check when page loads
checkScheduleAndNotify();

// Medicine Categories Data
const medicineData = {
    'diabetes': {
        medicines: [
            {
                name: 'Metformin',
                image: 'https://www.endocrinologyadvisor.com/wp-content/uploads/sites/9/2019/06/diabetes_G_1047558940.jpg',
                description: 'Metformin is used to treat type 2 diabetes. It helps control blood sugar levels.',
                dosage: '500-2000mg daily',
                sideEffects: ['Nausea', 'Diarrhea', 'Stomach pain', 'Loss of appetite'],
                precautions: 'Take with meals to minimize stomach upset. Avoid alcohol.'
            },
            // Add more diabetes medicines here
        ]
    },
    'heart': {
        medicines: [
            {
                name: 'Aspirin',
                image: 'https://c8.alamy.com/comp/2TDHN90/human-heart-with-medicine-capsules-medicines-for-heart-disease-concept-3d-rendering-isolated-on-white-background-2TDHN90.jpg',
                description: 'Aspirin is used to reduce the risk of heart attack and stroke.',
                dosage: '81-325mg daily',
                sideEffects: ['Stomach irritation', 'Bleeding risk', 'Heartburn'],
                precautions: 'Take with food. Consult doctor if you have bleeding disorders.'
            },
            // Add more heart medicines here
        ]
    },
    'blood-pressure': {
        medicines: [
            {
                name: 'Amlodipine',
                image: 'https://healthjade.net/wp-content/uploads/2017/12/low-blood-pressure.jpeg',
                description: 'Amlodipine is used to treat high blood pressure and angina.',
                dosage: '2.5-10mg daily',
                sideEffects: ['Dizziness', 'Swelling', 'Headache'],
                precautions: 'Take at the same time each day. Monitor blood pressure regularly.'
            },
            // Add more blood pressure medicines here
        ]
    },
    'arthritis': {
        medicines: [
            {
                name: 'Ibuprofen',
                image: 'https://universityhealthnews.com/wp-content/uploads/Bones-arthritis_generic_art.jpg',
                description: 'Ibuprofen is used to reduce pain, inflammation, and fever.',
                dosage: '200-400mg every 4-6 hours',
                sideEffects: ['Stomach pain', 'Heartburn', 'Dizziness'],
                precautions: 'Take with food or milk. Do not exceed 1200mg per day without consulting doctor.'
            },
            // Add more arthritis medicines here
        ]
    }
};

function showMedicineDetails(category) {
    const medicineDetailsDiv = document.getElementById('medicineDetails');
    const medicineCategoriesDiv = document.getElementById('medicineCategories');
    const categoryData = medicineData[category];

    if (categoryData) {
        let html = `<button class="back-btn" onclick="showCategories()">← Back to Categories</button><h2>${category.charAt(0).toUpperCase() + category.slice(1)} Medicines</h2><div class="medicine-grid">`;
        
        categoryData.medicines.forEach(medicine => {
            html += `
                <div class="medicine-card" onclick="showMedicineInfo('${medicine.name}', ${JSON.stringify(medicine).replace(/"/g, '&quot;')})">
                    <img src="${medicine.image}" alt="${medicine.name}">
                    <h3>${medicine.name}</h3>
                </div>
            `;
        });
        
        html += '</div>';
        medicineDetailsDiv.innerHTML = html;
        medicineDetailsDiv.style.display = 'block';
        medicineCategoriesDiv.style.display = 'none';
    }
}

function showMedicineInfo(name, medicine) {
    const medicineDetailsDiv = document.getElementById('medicineDetails');
    const html = `
        <button class="back-btn" onclick="showCategories()">← Back to Categories</button>
        <div class="medicine-info">
            <img src="${medicine.image}" alt="${medicine.name}">
            <h2>${medicine.name}</h2>
            <div class="info-section">
                <h3>Description</h3>
                <p>${medicine.description}</p>
            </div>
            <div class="info-section">
                <h3>Dosage</h3>
                <p>${medicine.dosage}</p>
            </div>
            <div class="info-section">
                <h3>Side Effects</h3>
                <ul>
                    ${medicine.sideEffects.map(effect => `<li>${effect}</li>`).join('')}
                </ul>
            </div>
            <div class="info-section">
                <h3>Precautions</h3>
                <p>${medicine.precautions}</p>
            </div>
        </div>
    `;
    medicineDetailsDiv.innerHTML = html;
}

function showCategories() {
    document.getElementById('medicineDetails').style.display = 'none';
    document.getElementById('medicineCategories').style.display = 'grid';
}
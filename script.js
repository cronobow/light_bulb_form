// Google Sheets Web App URL - 請替換成你的 Google Apps Script Web App URL
const GOOGLE_SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

let locationCounter = 0;
let locations = [];

// DOM Elements
const bulbTypeSelect = document.getElementById('bulbType');
const otherBulbTypeGroup = document.getElementById('otherBulbTypeGroup');
const locationsList = document.getElementById('locationsList');
const addLocationBtn = document.getElementById('addLocationBtn');
const form = document.getElementById('lightBulbForm');
const resetBtn = document.getElementById('resetBtn');
const totalQuantitySpan = document.getElementById('totalQuantity');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

// Initialize with one location
addLocation();

// Event Listeners
bulbTypeSelect.addEventListener('change', function() {
    if (this.value === '其他') {
        otherBulbTypeGroup.style.display = 'block';
        document.getElementById('otherBulbType').required = true;
    } else {
        otherBulbTypeGroup.style.display = 'none';
        document.getElementById('otherBulbType').required = false;
    }
});

addLocationBtn.addEventListener('click', addLocation);
resetBtn.addEventListener('click', resetForm);
form.addEventListener('submit', handleSubmit);

// Add new location
function addLocation() {
    locationCounter++;
    const locationId = `location-${locationCounter}`;
    
    const locationItem = document.createElement('div');
    locationItem.className = 'location-item';
    locationItem.id = locationId;
    locationItem.innerHTML = `
        <div class="location-header">
            <span class="location-number">位置 ${locationCounter}</span>
            ${locationCounter > 1 ? '<button type="button" class="remove-location" onclick="removeLocation(\'' + locationId + '\')">移除</button>' : ''}
        </div>
        <div class="location-fields">
            <div class="form-group">
                <label for="${locationId}-location">使用位置 *</label>
                <input type="text" id="${locationId}-location" name="location" required placeholder="例：辦公室、倉庫、走廊">
            </div>
            <div class="form-group">
                <label for="${locationId}-quantity">數量 *</label>
                <input type="number" id="${locationId}-quantity" name="quantity" min="1" required placeholder="1" onchange="updateTotal()">
            </div>
        </div>
    `;
    
    locationsList.appendChild(locationItem);
    locations.push(locationId);
    updateTotal();
}

// Remove location
function removeLocation(locationId) {
    const element = document.getElementById(locationId);
    if (element) {
        element.remove();
        locations = locations.filter(id => id !== locationId);
        renumberLocations();
        updateTotal();
    }
}

// Renumber locations after removal
function renumberLocations() {
    const locationItems = document.querySelectorAll('.location-item');
    locationItems.forEach((item, index) => {
        const numberSpan = item.querySelector('.location-number');
        numberSpan.textContent = `位置 ${index + 1}`;
    });
}

// Update total quantity
function updateTotal() {
    let total = 0;
    const quantityInputs = document.querySelectorAll('input[name="quantity"]');
    quantityInputs.forEach(input => {
        const value = parseInt(input.value) || 0;
        total += value;
    });
    totalQuantitySpan.textContent = total;
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    // Hide previous messages
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    
    // Get form data
    const requester = document.getElementById('requester').value;
    let bulbType = bulbTypeSelect.value;
    
    if (bulbType === '其他') {
        bulbType = document.getElementById('otherBulbType').value;
    }
    
    // Get all locations data
    const locationsData = [];
    const locationItems = document.querySelectorAll('.location-item');
    
    locationItems.forEach(item => {
        const locationInput = item.querySelector('input[name="location"]');
        const quantityInput = item.querySelector('input[name="quantity"]');
        
        if (locationInput && quantityInput) {
            locationsData.push({
                location: locationInput.value,
                quantity: parseInt(quantityInput.value) || 0
            });
        }
    });
    
    const total = locationsData.reduce((sum, loc) => sum + loc.quantity, 0);
    
    // Prepare data for Google Sheets
    const formData = {
        timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        requester: requester,
        bulbType: bulbType,
        locations: locationsData,
        totalQuantity: total
    };
    
    console.log('Submitting data:', formData);
    
    // Send to Google Sheets
    try {
        // 檢查是否已設定 Google Sheets URL
        if (GOOGLE_SHEET_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
            console.warn('Google Sheets URL 尚未設定');
            alert('請先在 script.js 中設定 Google Sheets Web App URL\n\n參考 README.md 中的說明進行設定');
            return;
        }
        
        const response = await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors', // 使用 no-cors 模式
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // 因為使用 no-cors，無法取得回應狀態，假設成功
        console.log('Data sent successfully');
        successMessage.style.display = 'block';
        
        // Reset form after successful submission
        setTimeout(() => {
            resetForm();
            successMessage.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error('Error submitting data:', error);
        errorMessage.style.display = 'block';
    }
}

// Reset form
function resetForm() {
    form.reset();
    otherBulbTypeGroup.style.display = 'none';
    
    // Clear all locations
    locationsList.innerHTML = '';
    locations = [];
    locationCounter = 0;
    
    // Add one location
    addLocation();
    
    updateTotal();
}

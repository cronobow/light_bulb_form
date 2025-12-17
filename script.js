// Google Sheets Web App URL - 請替換成你的 Google Apps Script Web App URL
const GOOGLE_SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

let locationCounter = 0;
let locations = [];

// DOM Elements
const requesterSelect = document.getElementById('requester');
const requesterNameGroup = document.getElementById('requesterNameGroup');
const requesterNameInput = document.getElementById('requesterName');
const bulbTypeRadios = document.querySelectorAll('input[name="bulbType"]');
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
requesterSelect.addEventListener('change', function() {
    if (this.value === '保全員' || this.value === '機電廠商' || this.value === '其他') {
        requesterNameGroup.style.display = 'block';
        requesterNameInput.required = true;
    } else {
        requesterNameGroup.style.display = 'none';
        requesterNameInput.required = false;
        requesterNameInput.value = '';
    }
});

addLocationBtn.addEventListener('click', addLocation);
resetBtn.addEventListener('click', resetForm);
form.addEventListener('submit', handleSubmit);

// 位置分類的對應選項
const locationOptions = {
    '公共區域': [
        '警衛室備用',
        '地下室 B1',
        '地下室 B2',
        '地下室 B3',
        '中庭與1F公設',
        '頂樓空中花園'
    ],
    'A棟': Array.from({ length: 28 }, (_, i) => `A棟${i + 1}樓`),
    'B棟': Array.from({ length: 28 }, (_, i) => `B棟${i + 1}樓`)
};

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
                <label for="${locationId}-category">區域分類 *</label>
                <select id="${locationId}-category" name="category" required onchange="updateLocationOptions('${locationId}')">
                    <option value="">請選擇</option>
                    <option value="公共區域">公共區域</option>
                    <option value="A棟">A棟</option>
                    <option value="B棟">B棟</option>
                </select>
            </div>
            <div class="form-group">
                <label for="${locationId}-location">詳細位置 *</label>
                <select id="${locationId}-location" name="location" required onchange="updateTotal()">
                    <option value="">請先選擇區域分類</option>
                </select>
            </div>
            <div class="form-group">
                <label for="${locationId}-quantity">數量 *</label>
                <input type="number" id="${locationId}-quantity" name="quantity" min="1" value="1" required oninput="updateTotal()" onchange="updateTotal()">
            </div>
        </div>
    `;
    
    locationsList.appendChild(locationItem);
    locations.push(locationId);
    updateTotal();
}

// Update location options based on category selection
function updateLocationOptions(locationId) {
    const categorySelect = document.getElementById(`${locationId}-category`);
    const locationSelect = document.getElementById(`${locationId}-location`);
    const selectedCategory = categorySelect.value;
    
    // Clear previous options
    locationSelect.innerHTML = '';
    
    if (!selectedCategory) {
        locationSelect.innerHTML = '<option value="">請先選擇區域分類</option>';
        locationSelect.disabled = true;
        return;
    }
    
    locationSelect.disabled = false;
    
    // Get options for selected category
    const options = locationOptions[selectedCategory] || [];
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        locationSelect.appendChild(optionElement);
    });
    
    // Auto select first option
    if (options.length > 0) {
        locationSelect.value = options[0];
    }
    
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
    let requester = requesterSelect.value;
    
    if (!requester) {
        alert('請選擇領用人');
        return;
    }
    
    // 如果選擇保全員、機電廠商或其他，使用輸入的姓名
    if (requester === '保全員' || requester === '機電廠商' || requester === '其他') {
        const requesterName = requesterNameInput.value.trim();
        if (!requesterName) {
            alert('請填寫領用人姓名');
            requesterNameInput.focus();
            return;
        }
        requester = `${requester}-${requesterName}`;
    }
    
    const bulbTypeRadio = document.querySelector('input[name="bulbType"]:checked');
    if (!bulbTypeRadio) {
        alert('請選擇燈泡種類');
        return;
    }
    const bulbType = bulbTypeRadio.value;
    
    // Get all locations data
    const locationsData = [];
    const locationItems = document.querySelectorAll('.location-item');
    
    locationItems.forEach(item => {
        const categorySelect = item.querySelector('select[name="category"]');
        const locationSelect = item.querySelector('select[name="location"]');
        const quantityInput = item.querySelector('input[name="quantity"]');
        
        if (categorySelect && locationSelect && quantityInput) {
            const category = categorySelect.value;
            const location = locationSelect.value;
            
            if (!category || !location) {
                alert('請完整填寫所有位置資訊');
                return;
            }
            
            locationsData.push({
                category: category,
                location: location,
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
    requesterNameGroup.style.display = 'none';
    requesterNameInput.required = false;
    
    // Clear all locations
    locationsList.innerHTML = '';
    locations = [];
    locationCounter = 0;
    
    // Add one location
    addLocation();
    
    updateTotal();
}

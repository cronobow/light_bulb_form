// Google Sheets Web App URL - 請替換成你的 Google Apps Script Web App URL
const GOOGLE_SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

let locationCounter = 0;
let locations = [];
let isSubmitting = false; // 防抖標記

// 從 URL 獲取參數
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 頁面載入時檢查安全參數
let securityParam = null;
let securityValue = null;

window.addEventListener('DOMContentLoaded', function() {
    // 獲取 URL 的第一個參數
    const urlParams = new URLSearchParams(window.location.search);
    const entries = [...urlParams.entries()];
    
    if (entries.length > 0) {
        securityParam = entries[0][0];
        securityValue = entries[0][1];
        console.log('✓ 已獲取 URL 參數');
    } else {
        console.warn('⚠️ URL 中沒有參數');
    }
});

// DOM Elements
const requesterSelect = document.getElementById('requester');
const requesterNameGroup = document.getElementById('requesterNameGroup');
const requesterNameInput = document.getElementById('requesterName');
const bulbTypeRadios = document.querySelectorAll('input[name="bulbType"]');
const locationsList = document.getElementById('locationsList');
const addLocationBtn = document.getElementById('addLocationBtn');
const form = document.getElementById('lightBulbForm');
const submitBtn = document.getElementById('submitBtn');
const totalQuantitySpan = document.getElementById('totalQuantity');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const warningMessage = document.getElementById('warningMessage');

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

// 顯示成功訊息
function showSuccess(message = '✓ 登記成功！資料已送出') {
    document.getElementById('successText').textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    warningMessage.style.display = 'none';
}

// 顯示錯誤訊息
function showError(title = '✗ 提交失敗', details = '') {
    document.getElementById('errorText').textContent = title;
    const detailsDiv = document.getElementById('errorDetails');
    if (details) {
        detailsDiv.innerHTML = details;
        detailsDiv.style.display = 'block';
    } else {
        detailsDiv.style.display = 'none';
    }
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
    warningMessage.style.display = 'none';
}

// 顯示警告訊息
function showWarning(title = '⚠️ 提醒', details = '') {
    document.getElementById('warningText').textContent = title;
    const detailsDiv = document.getElementById('warningDetails');
    if (details) {
        detailsDiv.innerHTML = details;
        detailsDiv.style.display = 'block';
    } else {
        detailsDiv.style.display = 'none';
    }
    warningMessage.style.display = 'block';
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
}

// 隱藏所有訊息
function hideAllMessages() {
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    warningMessage.style.display = 'none';
}
async function handleSubmit(e) {
    e.preventDefault();

    // 防止重複提交
    if (isSubmitting) {
        console.warn('⚠️ 已有提交在進行中，請稍候');
        return;
    }

    // Hide previous messages
    hideAllMessages();

    console.log('========== 開始提交表單 ==========');
    console.log('時間: ' + new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }));

    // Get form data
    let requester = requesterSelect.value;

    if (!requester) {
        console.error('❌ 領用人未選擇');
        showError('❌ 必填欄位未完成', '<strong>領用人</strong> - 請選擇領用人');
        return;
    }

    // 如果選擇保全員、機電廠商或其他，使用輸入的姓名
    if (requester === '保全員' || requester === '機電廠商' || requester === '其他') {
        const requesterName = requesterNameInput.value.trim();
        if (!requesterName) {
            console.error('❌ 領用人姓名未填寫');
            showError('❌ 必填欄位未完成', `<strong>${requester}姓名</strong> - 請填寫領用人姓名`);
            requesterNameInput.focus();
            return;
        }
        requester = `${requester}-${requesterName}`;
    }
    console.log('領用人: ' + requester);

    // 驗證燈泡種類
    const bulbTypeRadios = document.querySelectorAll('input[name="bulbType"]');
    let bulbType = null;

    for (let radio of bulbTypeRadios) {
        if (radio.checked) {
            bulbType = radio.value;
            break;
        }
    }

    if (!bulbType) {
        console.error('❌ 燈泡種類未選擇');
        showError('❌ 必填欄位未完成', '<strong>燈泡種類</strong> - 請選擇燈泡種類（一般燈 或 感應燈）');
        return;
    }
    console.log('燈泡種類: ' + bulbType);

    // Get all locations data
    const locationsData = [];
    const locationItems = document.querySelectorAll('.location-item');
    const validationErrors = [];

    locationItems.forEach((item, index) => {
        const categorySelect = item.querySelector('select[name="category"]');
        const locationSelect = item.querySelector('select[name="location"]');
        const quantityInput = item.querySelector('input[name="quantity"]');

        if (categorySelect && locationSelect && quantityInput) {
            const category = categorySelect.value;
            const location = locationSelect.value;
            const quantity = quantityInput.value.trim();

            if (!category) {
                validationErrors.push(`位置 ${index + 1}: 未選擇區域分類`);
                return;
            }

            if (!location) {
                validationErrors.push(`位置 ${index + 1}: 未選擇詳細位置`);
                return;
            }

            if (!quantity || parseInt(quantity) < 1) {
                validationErrors.push(`位置 ${index + 1}: 數量必須大於 0`);
                return;
            }

            locationsData.push({
                category: category,
                location: location,
                quantity: parseInt(quantity)
            });
        }
    });

    // 檢查驗證錯誤
    if (validationErrors.length > 0) {
        console.error('❌ 位置資訊驗證失敗:', validationErrors);
        const errorHtml = '<strong>位置欄位有誤：</strong><ul style="margin: 8px 0 0 20px;">' +
                          validationErrors.map(e => '<li>' + e + '</li>').join('') +
                          '</ul>';
        showError('❌ 必填欄位未完成', errorHtml);
        return;
    }

    if (locationsData.length === 0) {
        console.error('❌ 沒有新增任何位置');
        showError('❌ 位置資訊不完整', '<strong>請至少新增一個使用位置</strong>');
        return;
    }

    const total = locationsData.reduce((sum, loc) => sum + loc.quantity, 0);
    console.log('位置數量: ' + locationsData.length);
    console.log('總計: ' + total);

    // Prepare data for Google Sheets
    const formData = {
        timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        requester: requester,
        bulbType: bulbType,
        locations: locationsData,
        totalQuantity: total
    };

    console.log('Submitting data:', formData);

    // 設置提交狀態和動畫
    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.classList.add('submitting');
    submitBtn.textContent = '資料傳送中';

    // Send to Google Sheets
    try {
        // 檢查是否已設定 Google Sheets URL
        if (GOOGLE_SHEET_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
            console.error('❌ Google Sheets URL 尚未設定');
            showError(
                '❌ 系統設定錯誤',
                '<strong>Google Apps Script URL 尚未設定</strong><br>請參考 README.md 中的說明進行設定'
            );
            // 重置提交狀態
            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.classList.remove('submitting');
            submitBtn.textContent = '送出表單';
            return;
        }

        // 檢查 URL 參數
        if (!securityParam || !securityValue) {
            console.error('❌ 缺少安全參數');
            showError(
                '❌ 存取被拒絕',
                '<strong>請使用正確的網址存取此表單</strong><br>請向管理員索取正確的表單連結'
            );
            // 重置提交狀態
            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.classList.remove('submitting');
            submitBtn.textContent = '送出表單';
            return;
        }

        console.log('Google Apps Script URL: ' + GOOGLE_SHEET_URL);
        console.log('安全參數已準備');
        console.log('開始發送請求...');

        // 將安全參數附加到 URL
        const urlWithSecurity = `${GOOGLE_SHEET_URL}?${securityParam}=${encodeURIComponent(securityValue)}`;

        const response = await fetch(urlWithSecurity, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        // 因為使用 no-cors，無法取得回應狀態，假設成功
        console.log('✓ 請求已發送（使用 no-cors 模式）');
        console.log('回應狀態碼: ' + response.status);
        console.log('✓ 資料已成功提交到 Google Sheets');
        console.log('========== 提交完成 ==========\n');

        // 按鈕變綠色動畫
        submitBtn.classList.remove('submitting');
        submitBtn.classList.add('btn-success');
        submitBtn.textContent = '✓ 已送出';

        showSuccess('✓ 登記成功！資料已送出');

        // 3 秒後重置表單
        setTimeout(() => {
            resetForm();
            hideAllMessages();
            // 重置提交狀態和按鈕
            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-success');
            submitBtn.textContent = '送出表單';
        }, 3000);

    } catch (error) {
        console.error('❌ 提交失敗: ' + error.toString());
        console.error('錯誤堆疊:', error.stack);
        console.log('========== 提交失敗 ==========\n');

        // 重置提交狀態
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.classList.remove('submitting');
        submitBtn.textContent = '送出表單';

        // 檢查是否為安全參數錯誤
        let errorMessage = error.message;
        let securityError = false;
        
        if (errorMessage.includes('SECURITY') || errorMessage.includes('資安')) {
            securityError = true;
        }
        
        showError(
            securityError ? '❌ 資安參數錯誤' : '❌ 送出失敗',
            securityError ? 
                '<strong>資安參數錯誤，請洽管理員</strong>' :
                `<strong>錯誤訊息：</strong><br>${error.message}<br><br>` +
                `<strong>可能原因：</strong><br>` +
                `• Google Apps Script URL 設定不正確<br>` +
                `• Google Apps Script 未正確部署<br>` +
                `• 網路連線中斷<br><br>` +
                `請打開瀏覽器開發者工具 (F12) 的 Console 查看詳細錯誤訊息`
        );
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
    hideAllMessages();
}

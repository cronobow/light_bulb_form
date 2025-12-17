# 資安考量與改善建議

## 目前系統的資安狀況

### ✅ 已具備的安全措施

1. **HTTPS 傳輸**
   - GitHub Pages 預設使用 HTTPS
   - 資料傳輸經過加密

2. **輸入驗證**
   - 前端：HTML5 表單驗證（required, type, min）
   - 後端：Google Apps Script 驗證資料完整性

3. **錯誤處理**
   - 適當的 try-catch 機制
   - 不洩露敏感錯誤訊息

### ⚠️ 潛在的安全風險

1. **無身份驗證**
   - ❌ 任何人都可以提交表單
   - ❌ 沒有使用者身份確認

2. **無存取控制**
   - ❌ Web App URL 若被知道，任何人都可以寫入資料
   - ❌ 沒有 IP 白名單或來源限制

3. **無防濫用機制**
   - ❌ 沒有 rate limiting
   - ❌ 可能被大量提交攻擊

4. **資料隱私**
   - ⚠️ Google Sheets 資料可能被有權限的人看到
   - ⚠️ 沒有資料加密儲存

5. **CORS 設定**
   - ⚠️ Google Apps Script 預設允許所有來源

## 建議的安全改善方案

### 方案 1：簡單密碼保護（適合內部使用）

**實作難度：⭐ 簡單**

#### 前端修改 (script.js)

在表單中加入密碼欄位：

```javascript
// 在 index.html 的表單中加入：
<div class="form-group">
    <label for="password">存取密碼 *</label>
    <input type="password" id="password" name="password" required>
</div>

// 在 script.js 的 handleSubmit 中加入：
const formData = {
    password: document.getElementById('password').value, // 加入這行
    timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    requester: requester,
    bulbType: bulbType,
    locations: locationsData,
    totalQuantity: total
};
```

#### 後端修改 (Code.gs)

```javascript
// 在檔案開頭加入
const VALID_PASSWORD = 'your_secure_password_here'; // 請改成強密碼

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // 驗證密碼
    if (data.password !== VALID_PASSWORD) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: '密碼錯誤'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 移除密碼，不儲存到 Sheet
    delete data.password;
    
    // ... 原本的程式碼
  } catch (error) {
    // ... 錯誤處理
  }
}
```

**優點**：
- ✅ 簡單易實作
- ✅ 阻擋大部分未經授權的存取

**缺點**：
- ❌ 密碼在前端可被看到（開發者工具）
- ❌ 需要讓所有使用者知道密碼
- ❌ 密碼若外洩需要更新程式碼

---

### 方案 2：Token 驗證（較安全）

**實作難度：⭐⭐ 中等**

#### 後端修改 (Code.gs)

```javascript
// 使用 Google Apps Script 的 PropertiesService 儲存 token
function generateToken() {
  const token = Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty('API_TOKEN', token);
  Logger.log('Generated Token: ' + token);
  return token;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const validToken = PropertiesService.getScriptProperties().getProperty('API_TOKEN');
    
    // 驗證 token
    if (data.token !== validToken) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: '無效的存取權杖'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ... 原本的程式碼
  } catch (error) {
    // ... 錯誤處理
  }
}
```

#### 前端修改 (script.js)

```javascript
// 在檔案開頭
const API_TOKEN = 'YOUR_TOKEN_HERE'; // 執行 generateToken() 後填入

const formData = {
    token: API_TOKEN,
    timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    // ... 其他資料
};
```

**優點**：
- ✅ Token 可以隨時更換
- ✅ 不需要使用者輸入密碼
- ✅ 較難被猜測

**缺點**：
- ⚠️ Token 仍在前端程式碼中（可被看到）

---

### 方案 3：Google OAuth 登入（最安全）

**實作難度：⭐⭐⭐ 較複雜**

需要使用 Google Identity Platform，讓使用者用 Google 帳號登入。

**優點**：
- ✅ 真正的使用者身份驗證
- ✅ 可追蹤是誰提交的
- ✅ 可限制特定網域（如公司帳號）

**缺點**：
- ❌ 實作較複雜
- ❌ 需要額外設定 OAuth

---

### 方案 4：IP 白名單（適合固定地點）

**實作難度：⭐⭐ 中等**

#### 後端修改 (Code.gs)

```javascript
const ALLOWED_IPS = [
  '1.2.3.4',      // 公司 IP
  '5.6.7.8'       // 其他允許的 IP
];

function doPost(e) {
  try {
    // 注意：Google Apps Script 可能無法直接取得真實 IP
    // 這個方法有限制
    
    const clientIP = e.parameter.userip || '';
    
    if (!ALLOWED_IPS.includes(clientIP)) {
      return ContentService.createTextOutput('Access Denied');
    }
    
    // ... 原本的程式碼
  } catch (error) {
    // ... 錯誤處理
  }
}
```

**優點**：
- ✅ 限制只有特定地點可存取

**缺點**：
- ❌ Google Apps Script 難以取得真實 IP
- ❌ 不適合遠端工作或行動裝置
- ❌ IP 可能會變動

---

### 方案 5：Rate Limiting（防濫用）

**實作難度：⭐⭐ 中等**

#### 後端修改 (Code.gs)

```javascript
function checkRateLimit(identifier) {
  const cache = CacheService.getScriptCache();
  const key = 'rate_limit_' + identifier;
  const count = cache.get(key) || 0;
  
  if (parseInt(count) >= 10) { // 每小時最多 10 次
    return false;
  }
  
  cache.put(key, parseInt(count) + 1, 3600); // 1 小時過期
  return true;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // 使用領用人姓名作為識別
    if (!checkRateLimit(data.requester)) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: '提交次數過多，請稍後再試'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ... 原本的程式碼
  } catch (error) {
    // ... 錯誤處理
  }
}
```

**優點**：
- ✅ 防止大量提交攻擊
- ✅ 不影響正常使用

**缺點**：
- ⚠️ 可能誤擋合法使用者

---

## 推薦的組合方案

### 🏆 方案 A：內部小型團隊使用
**方案 1（密碼保護）+ 方案 5（Rate Limiting）**

- 實作簡單
- 足夠的基本安全性
- 適合 10-50 人的團隊

### 🏆 方案 B：中型企業使用
**方案 2（Token 驗證）+ 方案 5（Rate Limiting）**

- 安全性較高
- Token 可定期更換
- 適合 50-200 人的組織

### 🏆 方案 C：需要高安全性
**方案 3（Google OAuth）+ 方案 5（Rate Limiting）**

- 最高安全性
- 可追蹤使用者行為
- 適合處理敏感資料

---

## 其他安全建議

### 1. 定期檢查資料

定期檢查 Google Sheets 是否有異常提交：
- 檢查是否有異常大量的提交
- 檢查是否有奇怪的領用人姓名
- 設定 Google Sheets 的通知功能

### 2. 限制 Google Sheets 權限

- ✅ 只給需要的人編輯權限
- ✅ 其他人只給檢視權限
- ✅ 定期審查權限清單

### 3. 備份資料

定期備份 Google Sheets：
- 可以使用 Google Sheets 的「檔案」→「下載」
- 或使用 Google Drive 的版本歷史記錄

### 4. 監控異常

在 Google Apps Script 中加入記錄功能：

```javascript
function logAccess(data) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('存取記錄');
  if (logSheet) {
    logSheet.appendRow([
      new Date(),
      data.requester,
      'SUCCESS'
    ]);
  }
}
```

### 5. 使用 HTTPS（已達成）

GitHub Pages 預設使用 HTTPS，確保資料傳輸安全。

### 6. 不要在前端儲存敏感資訊

- ❌ 不要在前端程式碼中寫入 Google Sheets ID
- ❌ 不要在前端程式碼中寫入強密碼
- ✅ 使用環境變數或後端驗證

---

## 快速安全檢查清單

- [ ] 已設定基本驗證機制（密碼或 Token）
- [ ] 已實作 Rate Limiting
- [ ] 限制 Google Sheets 的編輯權限
- [ ] 定期檢查異常提交
- [ ] 定期備份資料
- [ ] 使用 HTTPS（GitHub Pages 預設）
- [ ] 不在表單中收集敏感個人資訊
- [ ] 定期更換存取密碼/Token
- [ ] 監控 Google Apps Script 的執行記錄

---

## 如果發現安全問題怎麼辦？

1. **立即停用 Web App**
   - 在 Google Apps Script 中停用部署

2. **更改所有密碼/Token**
   - 重新生成新的驗證憑證

3. **檢查資料是否被竄改**
   - 查看 Google Sheets 的版本歷史記錄

4. **重新部署**
   - 使用新的 Web App URL

---

## 結論

目前的系統適合**內部、小規模、非敏感資料**的使用。

如果需要處理敏感資訊或大規模使用，建議：
1. 實作至少「方案 1 + 方案 5」
2. 定期審查和更新安全措施
3. 考慮使用專業的表單服務（如 Google Forms、Typeform）

記得：**沒有絕對安全的系統，只有相對安全的做法**。定期檢查和更新是保持安全的關鍵！

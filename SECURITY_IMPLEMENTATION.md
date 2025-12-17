# 🔒 資安實現文件

## 1. 安全檢查機制

### 聰明的雙重驗證設計

此系統採用**URL 參數雙重驗證**機制：

1. **參數名稱驗證** - 檢查參數的 key 是否正確
2. **參數值驗證** - 檢查參數的 value 是否正確

### 工作原理

使用者必須透過**帶有正確參數的 URL** 才能提交表單：

```
https://your-domain.com/index.html?參數名稱=參數值
```

例如：`index.html?security_key=abc123xyz`

- 參數名稱：`security_key`
- 參數值：`abc123xyz`

兩者都必須正確，後端才會接受資料寫入。

---

## 2. 為什麼這個方法很聰明？

### ✅ 優點

1. **雙重保護**
   - 不只是單一密碼
   - 需要同時知道參數名稱和參數值

2. **完全不洩露**
   - 參數名稱不在程式碼中
   - 參數值也不在程式碼中
   - 只有管理員知道完整的 URL

3. **簡單分享**
   - 直接給使用者完整的 URL
   - 使用者不需要記憶任何密碼
   - 複製貼上即可使用

4. **易於管理**
   - 需要更換？只需改 Google Apps Script 中的兩個常數
   - 不需要重新編譯或部署前端

---

## 3. 實作細節

### 前端實作 (script.js)

```javascript
// 1. 頁面載入時自動讀取 URL 參數
window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const entries = [...urlParams.entries()];
    
    if (entries.length > 0) {
        securityParam = entries[0][0];  // 取得第一個參數的名稱
        securityValue = entries[0][1];  // 取得第一個參數的值
    }
});

// 2. 提交時檢查參數是否存在
if (!securityParam || !securityValue) {
    showError('請使用正確的網址存取此表單');
    return;
}

// 3. 將參數附加到 API 請求
const urlWithSecurity = `${GOOGLE_SHEET_URL}?${securityParam}=${securityValue}`;
fetch(urlWithSecurity, { ... });
```

### 後端驗證 (Code.gs)

```javascript
// 設定你的安全參數（不要推送到公開 repo）
const SECURITY_PARAM_NAME = 'your_param_name';
const SECURITY_PARAM_VALUE = 'your_param_value';

function verifySecurityParams(params) {
  // 檢查 1：參數名稱是否存在
  if (!params.hasOwnProperty(SECURITY_PARAM_NAME)) {
    return false;
  }
  
  // 檢查 2：參數值是否正確
  if (params[SECURITY_PARAM_NAME] !== SECURITY_PARAM_VALUE) {
    return false;
  }
  
  return true;
}

function doPost(e) {
  // 第一步：驗證安全參數
  if (!verifySecurityParams(e.parameter)) {
    Logger.log('❌ 安全參數驗證失敗');
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      code: 'SECURITY_FAILED',
      message: '資安參數錯誤'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // 驗證通過，繼續處理...
}
```

---

## 4. 安全性分析

### 攻擊情境模擬

#### 情境 1：攻擊者知道網址但沒有參數
```
❌ https://your-domain.com/index.html
```
- 前端：無法取得參數，顯示「請使用正確的網址」
- 後端：不會收到請求

#### 情境 2：攻擊者知道參數名稱但不知道值
```
❌ https://your-domain.com/index.html?security_key=wrong_value
```
- 前端：可以取得參數
- 後端：驗證失敗，拒絕寫入

#### 情境 3：攻擊者知道參數值但不知道名稱
```
❌ https://your-domain.com/index.html?wrong_key=abc123xyz
```
- 前端：可以取得參數（但名稱錯誤）
- 後端：驗證失敗，拒絕寫入

#### 情境 4：攻擊者同時知道名稱和值
```
✅ https://your-domain.com/index.html?security_key=abc123xyz
```
- 可以提交（但這代表 URL 已洩露）

---

## 5. 檔案保護機制

### .gitignore 設定

```
# Google Apps Script - 包含敏感安全參數
Code.gs

# 設定指南 - 包含完整程式碼範例
CODE_GS_SETUP.md
```

### 文件架構

| 檔案 | 狀態 | 內容 |
|------|------|------|
| `script.js` | ✅ 公開 | 前端邏輯，不含任何安全參數 |
| `Code.gs` | ❌ 隱藏 | 後端程式碼，含實際參數名稱和值 |
| `CODE_GS_SETUP.md` | ❌ 隱藏 | 完整設定指南 |
| `Code.gs.template` | ✅ 公開 | 空模板，僅說明結構 |
| `SECURITY_IMPLEMENTATION.md` | ✅ 公開 | 本文件，說明原理但不含實際值 |

---

## 6. 部署步驟

### 步驟 1：設定 Google Apps Script

1. 參考 `CODE_GS_SETUP.md` 的完整程式碼
2. 在 Code.gs 中設定你的參數名稱和值
3. 部署為 Web App
4. 複製 Web App URL

### 步驟 2：更新前端設定

在 `script.js` 第 2 行更新：
```javascript
const GOOGLE_SHEET_URL = '你的 Web App URL';
```

### 步驟 3：測試

使用正確的 URL 測試：
```
http://localhost/index.html?your_param=your_value
```

### 步驟 4：分享

只分享完整的 URL 給需要填寫表單的人：
```
https://your-domain.com/index.html?your_param=your_value
```

---

## 7. 優勢總結

| 特性 | 傳統密碼 | URL 參數雙重驗證 |
|------|---------|------------------|
| 使用者體驗 | 需要輸入密碼 | 點開連結即可 |
| 安全性 | 單一密碼 | 雙重驗證（名稱+值）|
| 洩露風險 | 程式碼中可見 | 完全不在公開程式碼中 |
| 更換難度 | 需更新前端 | 只需更新後端 |
| 分享方式 | 告知密碼 | 分享完整 URL |

---

## 8. 注意事項

### ⚠️ 重要提醒

1. **不要將完整 URL 公開發布**
   - 不要發在公開網站上
   - 不要寫在 README 中
   - 只透過私人訊息分享

2. **定期更換參數**
   - 建議每季更換一次
   - 更換後重新部署 Google Apps Script
   - 通知所有使用者新的 URL

3. **監控異常存取**
   - 定期檢查 Google Apps Script 執行記錄
   - 注意是否有大量失敗的驗證嘗試

4. **如果 URL 洩露**
   - 立即在 Code.gs 中更改參數名稱和值
   - 重新部署 Web App
   - 通知所有合法使用者新的 URL

---

## 9. 未來改進建議

1. **時效性 URL**
   - 參數中加入時間戳
   - URL 只在特定時間內有效

2. **使用次數限制**
   - 每個 URL 只能使用 N 次
   - 需要後端儲存使用記錄

3. **IP 綁定**
   - 特定 URL 只能從特定 IP 使用
   - 適合固定地點的使用情境

4. **動態參數**
   - 每次產生不同的參數組合
   - 需要資料庫儲存有效參數列表

---

祝系統運行安全！🔒

**記得：參數名稱和參數值都不應該出現在任何公開文件中！**
```javascript
// URL 中應包含安全參數
const GOOGLE_SHEET_URL = 'https://script.google.com/.../exec?check_code=YOUR_SECURITY_CODE_HERE';

const response = await fetch(GOOGLE_SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
});
```

### 後端驗證 (Code.gs)
```javascript
// ⚠️ 不要推送到公開 repo
const SECURITY_CHECK_CODE = 'YOUR_ACTUAL_SECURITY_CODE';

function verifySecurityCode(checkCode) {
  return checkCode === SECURITY_CHECK_CODE;
}

function doPost(e) {
  // 第一步：驗證安全參數
  const checkCode = e.parameter.check_code || '';
  
  if (!verifySecurityCode(checkCode)) {
    Logger.log('❌ 安全參數驗證失敗');
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      code: 'SECURITY_FAILED',
      message: '資安參數錯誤'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // 通過驗證後才能進行後續操作
  // ...
}
```

---

## 2. Code.gs 保護機制

### .gitignore 設定

`Code.gs` 已加入 `.gitignore` 以防止敏感的安全參數被推送到公開 repo：

```
# Google Apps Script - 包含敏感安全參數
Code.gs
```

### 為什麼要保護 Code.gs？

❌ **不安全的做法：**
- 將含有實際安全碼的代碼推送到 GitHub
- 任何人都可以看到安全碼
- 可被濫用提交表單資料

✅ **安全的做法：**
- `Code.gs` 只保存在本地和 Google Apps Script 編輯器
- 安全碼不會出現在公開 repo 中
- 即使 GitHub repo 被複製，也無法獲得安全碼

---

## 3. 錯誤處理

### 前端錯誤訊息

當安全參數驗證失敗時，用戶會看到：

```
❌ 資安參數錯誤
資安參數錯誤，請洽管理員
```

### 後端日誌

Google Apps Script 的執行記錄會記錄：
```
❌ 安全參數驗證失敗
```

---

## 4. 設定步驟

### 步驟 1：決定你的安全碼

選擇一個安全的檢查碼，例如：
- 隨機字串
- 難以猜測的組合
- 至少 8 個字符

**⚠️ 不要在任何文檔或程式碼註解中寫下實際的安全碼！**

### 步驟 2：在 Google Apps Script 中設定

1. 打開你的 Google Sheets
2. 點選「擴充功能」→「Apps Script」
3. 建立新的 `Code.gs` 文件
4. 在代碼開頭加入：
   ```javascript
   const SECURITY_CHECK_CODE = '你的實際安全碼';
   ```
5. 部署為 Web App

### 步驟 3：在 script.js 中設定

在 `script.js` 的第 1-3 行：
```javascript
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?check_code=你的實際安全碼';
```

### 步驟 4：確認 .gitignore 設定

`.gitignore` 中應包含：
```
# Google Apps Script - 包含敏感安全參數
Code.gs
```

**⚠️ 注意：script.js 不在 .gitignore 中，因為它是前端運行必需的。**  
**因此，不要在 script.js 的註解或其他地方留下明顯的安全提示。**

---

## 5. 文件架構

### 公開檔案（推送到 GitHub）
- ✅ `index.html` - 表單頁面
- ✅ `styles.css` - 樣式表
- ✅ `script.js` - 前端邏輯（URL 中含安全參數，但標示為 YOUR_SECURITY_CODE_HERE）
- ✅ `Code.gs.template` - 模板說明
- ✅ `debug.html` - 除錯工具
- ✅ 其他文檔

### 保護檔案（.gitignore 中）
- ❌ `Code.gs` - 後端程式碼（含實際安全碼）

### 需要手動配置的檔案
- ⚙️ `script.js` - 需要手動替換 YOUR_SECURITY_CODE_HERE 為實際安全碼

---

## 6. 安全性總結

| 項目 | 狀態 | 說明 |
|------|------|------|
| 安全檢查碼 | ✅ 已實現 | 前端 URL 中含安全參數 |
| Code.gs 保護 | ✅ 已實現 | 不推送到公開 repo |
| 安全碼隱藏 | ⚠️ 部分 | script.js 需手動替換佔位符 |
| 無效請求拒絕 | ✅ 已實現 | 安全碼不符則不寫入資料 |
| 錯誤提示 | ✅ 已實現 | 顯示「資安參數錯誤」 |

---

## 7. 未來改進建議

1. **更複雜的檢查碼**
   - 現在：固定的字串
   - 未來：可加入時間戳或 HMAC 簽名

2. **環境變數或配置文件**
   - 將安全碼存放在 `.env` 文件中（也要加入 .gitignore）
   - 使用 webpack 或其他打包工具在構建時注入

3. **速率限制**
   - 防止暴力破解
   - 限制單位時間內的請求數

4. **IP 白名單**
   - 限制特定 IP 才能提交（如公司內網）

5. **驗證碼或 CAPTCHA**
   - 防止自動化濫用

---

## ⚠️ 重要提醒

### 安全碼管理

1. **不要在公開檔案中洩露檢查碼**
   - ❌ 不要在 README.md 中寫實際的安全碼
   - ❌ 不要在 GitHub 的 Issue 或 Discussion 中提及
   - ❌ 不要在程式碼註解中寫明文安全碼
   - ✅ 只在本地的 Code.gs 和 script.js 中使用

2. **script.js 的安全考量**
   - ⚠️ script.js 是公開的，包含安全碼
   - 這是前端必需的限制
   - 如需更高安全性，考慮其他方案（如 OAuth）

3. **定期審查安全性**
   - 檢查 Git 歷史，確保沒有洩露的檢查碼
   - 監控 Google Apps Script 的執行記錄

4. **如果檢查碼被洩露**
   - 立即在 Code.gs 中更改檢查碼
   - 在 script.js 中更新新的檢查碼
   - 重新部署 Web App
   - 通知所有使用者更新頁面

---

## 📝 部署檢查清單

部署前請確認：

- [ ] Code.gs 中的 SECURITY_CHECK_CODE 已設定實際安全碼
- [ ] script.js 中的 GOOGLE_SHEET_URL 包含 ?check_code=實際安全碼
- [ ] Code.gs 已在 .gitignore 中
- [ ] 已測試表單提交功能
- [ ] 已測試錯誤的安全碼會被拒絕
- [ ] 沒有在公開文檔中提及實際安全碼

---

祝系統運行安全！🔒

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

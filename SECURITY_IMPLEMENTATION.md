# 🔒 資安實現文件

## 1. 安全檢查碼機制

### 實現方式

表單提交時，前端會自動附加安全參數 `check_code=dfsh_bulb` 到 Web App URL。

### 前端實作 (script.js)
```javascript
const urlWithParams = GOOGLE_SHEET_URL + '?check_code=dfsh_bulb';

const response = await fetch(urlWithParams, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
});
```

### 後端驗證 (Code.gs)
```javascript
// ⚠️ 不要推送到公開 repo
const SECURITY_CHECK_CODE = 'dfsh_bulb';

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
- 將含有 `check_code=dfsh_bulb` 的代碼推送到 GitHub
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

### 步驟 1：在 Google Apps Script 中建立 Code.gs

1. 打開你的 Google Sheets
2. 點選「擴充功能」→「Apps Script」
3. 建立新的 `Code.gs` 文件
4. 複製 Code.gs 完整代碼（參考 `Code.gs.template` 的結構）
5. 在代碼中加入：
   ```javascript
   const SECURITY_CHECK_CODE = 'dfsh_bulb';
   ```
6. 部署為 Web App

### 步驟 2：確認 .gitignore 設定

`.gitignore` 中應包含：
```
# Google Apps Script - 包含敏感安全參數
Code.gs
```

### 步驟 3：驗證前端配置

`script.js` 中應包含：
```javascript
const urlWithParams = GOOGLE_SHEET_URL + '?check_code=dfsh_bulb';
```

---

## 5. 文件架構

### 公開檔案（可推送到 GitHub）
- ✅ `index.html` - 表單頁面
- ✅ `styles.css` - 樣式表
- ✅ `script.js` - 前端邏輯（含安全檢查碼）
- ✅ `Code.gs.template` - 模板說明
- ✅ `debug.html` - 除錯工具
- ✅ 其他文檔

### 保護檔案（.gitignore 中）
- ❌ `Code.gs` - 後端程式碼（含安全碼）
- ❌ `.env` - 環境變數（如有）

---

## 6. 安全性總結

| 項目 | 狀態 | 說明 |
|------|------|------|
| 安全檢查碼 | ✅ 已實現 | 前端自動附加 `check_code=dfsh_bulb` |
| Code.gs 保護 | ✅ 已實現 | 不推送到公開 repo |
| 安全碼隱藏 | ✅ 已實現 | 只保存在 Google Apps Script 編輯器 |
| 無效請求拒絕 | ✅ 已實現 | 安全碼不符則不寫入資料 |
| 錯誤提示 | ✅ 已實現 | 顯示「資安參數錯誤」 |

---

## 7. 未來改進建議

1. **更複雜的檢查碼**
   - 現在：固定的 `dfsh_bulb`
   - 未來：可加入時間戳或 HMAC 簽名

2. **速率限制**
   - 防止暴力破解
   - 限制單位時間內的請求數

3. **IP 白名單**
   - 限制特定 IP 才能提交（如公司內網）

4. **驗證碼或 CAPTCHA**
   - 防止自動化濫用

5. **資料加密**
   - 傳輸層：HTTPS（已有）
   - 應用層：加密敏感資料

---

## ⚠️ 重要提醒

1. **不要在公開檔案中洩露檢查碼**
   - ❌ 不要在 README.md 中寫 `check_code=dfsh_bulb`
   - ❌ 不要在 GitHub 的 Issue 或 Discussion 中提及
   - ✅ 只在 Google Apps Script 編輯器中使用

2. **定期審查安全性**
   - 檢查 Git 歷史，確保沒有洩露的檢查碼
   - 監控 Google Apps Script 的執行記錄

3. **如果檢查碼被洩露**
   - 立即在 Code.gs 中更改檢查碼
   - 重新部署 Web App
   - 在 script.js 中更新新的檢查碼

---

祝系統運行安全！🔒

# 🔒 資安實現文件

## 1. 安全檢查碼機制

### 實現方式

表單提交時，前端會自動附加安全參數 `check_code=<安全碼>` 到 Web App URL。

### 前端實作 (script.js)
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

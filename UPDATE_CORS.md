# ⚠️ 重要說明：Google Apps Script 的 CORS 限制

## 問題

Google Apps Script 部署的 Web App **不支援 CORS**（Cross-Origin Resource Sharing），這意味著：

1. ❌ 前端無法使用正常的 `fetch()` 讀取回應
2. ❌ 無法得知提交是否成功
3. ❌ 無法接收錯誤訊息

## 目前的解決方案

使用 **no-cors 模式**：

```javascript
fetch(url, {
    method: 'POST',
    mode: 'no-cors',  // 關鍵設定
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});
```

### ✅ 優點
- 可以成功發送請求
- Google Apps Script 會接收並處理資料

### ❌ 限制
- 前端無法讀取回應內容
- 無法確認是否真的成功
- 無法顯示具體的錯誤訊息

---

## 📋 現在的使用者體驗

### 情況 1：參數正確 ✅
```
使用者看到：✓ 登記成功！資料已送出
實際結果：資料成功寫入 Google Sheets
```

### 情況 2：參數錯誤 ❌
```
使用者看到：✓ 登記成功！資料已送出（前端無法知道錯誤）
實際結果：Google Apps Script 拒絕寫入，但前端不知道
```

**解決方式：**
成功訊息中加入提示：
```
✓ 登記成功！資料已送出
※ 如果使用錯誤的網址，資料將不會被記錄
```

---

## 🔍 如何驗證資料是否真的被記錄？

### 方法 1：檢查 Google Sheets
1. 打開你的 Google Sheets
2. 查看「燈泡使用登記表」工作表
3. 確認最新的資料是否存在

### 方法 2：檢查 Google Apps Script 日誌
1. 打開 Google Apps Script 編輯器
2. 點選「執行作業」→「我的執行作業」
3. 查看最近的執行記錄
4. 如果看到「❌ 安全參數驗證失敗」就代表參數錯誤

---

## 💡 為什麼不能支援 CORS？

這是 Google Apps Script 的限制：

```
Access to fetch at 'https://script.google.com/...' 
from origin 'null' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

Google Apps Script 的回應中沒有包含 `Access-Control-Allow-Origin` header，這是瀏覽器安全政策的要求。

---

## 🎯 最佳實踐

### 對於管理員（你）：
1. **測試時使用正確的 URL 參數**
2. **定期檢查 Google Apps Script 執行記錄**
3. **定期檢查 Google Sheets 是否有新資料**
4. **提供正確的 URL 給使用者**

### 對於使用者：
1. **使用管理員提供的完整 URL**
2. **提交後到 Google Sheets 確認資料**
3. **如果沒看到資料，聯絡管理員**

---

## 📝 其他可能的解決方案

### 方案 1：Google Forms
優點：完整支援、有驗證  
缺點：樣式和功能受限

### 方案 2：使用 Google Sheets API
優點：完整的 API 功能  
缺點：需要 OAuth 認證，複雜度高

### 方案 3：架設自己的後端
優點：完全控制  
缺點：需要伺服器和資料庫

### 方案 4：使用 Webhook 服務（如 Zapier）
優點：簡單易用  
缺點：需要付費訂閱

---

## ✅ 目前方案的總結

**優點：**
- ✅ 部署簡單，使用 Google Apps Script 免費服務
- ✅ URL 參數雙重驗證提供基本安全性
- ✅ 資料存在 Google Sheets，方便管理
- ✅ 不需要額外的伺服器或資料庫

**限制：**
- ❌ 前端無法確認提交結果
- ⚠️ 使用者需要自行到 Google Sheets 確認

**適用情境：**
- ✅ 內部使用，使用者可以信任管理員提供的 URL
- ✅ 使用者有權限檢查 Google Sheets
- ✅ 不需要即時的錯誤反饋

---

更新日期：2024-12-17

**結論：在目前的架構下，no-cors 模式是最佳選擇。**

---

## 📋 更新步驟

### 步驟 1：在 Code.gs 中加入輔助函數

在 `verifySecurityParams()` 函數後面，加入這個新函數：

```javascript
// 建立 JSON 回應（包含 CORS headers）
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 步驟 2：替換所有回應

將所有的：
```javascript
return ContentService.createTextOutput(JSON.stringify({
  status: 'error',
  code: 'SECURITY_FAILED',
  message: '資安參數錯誤'
})).setMimeType(ContentService.MimeType.JSON);
```

替換為：
```javascript
return createJsonResponse({
  status: 'error',
  code: 'SECURITY_FAILED',
  message: '資安參數錯誤'
});
```

### 步驟 3：更新完整的 Code.gs

完整的程式碼請參考 `CODE_GS_SETUP.md`，它已經包含所有更新。

---

## 🎯 現在的行為

### ✅ 安全參數正確
```
使用者看到：✓ 登記成功！資料已送出
```

### ❌ 安全參數錯誤
```
使用者看到：❌ 資安參數錯誤
資安參數錯誤，請洽管理員
您使用的網址可能不正確或已過期
```

### ❌ 其他錯誤
```
使用者看到：❌ 送出失敗
錯誤訊息：[具體錯誤內容]
```

---

## 📝 測試方式

### 測試 1：正確的參數
```
https://your-domain.com/index.html?check_code=dfsh_bulb
```
應該看到：✓ 登記成功

### 測試 2：錯誤的參數值
```
https://your-domain.com/index.html?check_code=wrong_value
```
應該看到：❌ 資安參數錯誤

### 測試 3：錯誤的參數名稱
```
https://your-domain.com/index.html?wrong_param=dfsh_bulb
```
應該看到：❌ 資安參數錯誤

### 測試 4：沒有參數
```
https://your-domain.com/index.html
```
應該看到：❌ 存取被拒絕（在點擊送出按鈕前就會提示）

---

## ⚠️ 重要提醒

更新 Code.gs 後，記得：
1. **保存** Code.gs
2. **重新部署** Web App（建立新版本）
3. **測試**所有情境

---

更新日期：2024-12-17

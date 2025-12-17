# Light Bulb Inventory Form 燈泡庫存登記表

Google Sheets 網頁表單系統，用於登記燈泡領用記錄。

## ✨ 功能

- **表單提交** - 記錄領用人、燈泡種類、位置和數量
- **即時驗證** - 客戶端表單驗證和伺服器安全檢查
- **多位置支援** - 支援多筆位置資訊提交
- **自動統計** - Google Sheets 內建統計報表
- **安全機制** - 安全參數驗證防止未授權存取

## 🔒 安全設定

### 1. 設定安全參數 (Code.gs)

編輯 `Code.gs` 第 5-6 行，設定自訂的安全參數：

```javascript
const SECURITY_PARAM_NAME = 'YOUR_SECURITY_PARAM_NAME';
const SECURITY_PARAM_VALUE = 'YOUR_SECURITY_PARAM_VALUE';
```

### 2. 設定 Google Apps Script URL (script.js)

編輯 `script.js` 第 2 行，設定 Google Apps Script Web App URL：

```javascript
const GOOGLE_SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
```

### 取得 Google Apps Script URL

1. 在 Google Sheets 中開啟 Apps Script 編輯器
2. 點擊 "部署" → "新增部署"
3. 選擇類型為 "Web 應用程式"
4. 執行身份：Google Sheets 的擁有者
5. 誰可存取：任何人
6. 部署完成後複製 URL 並替換上述值

## 📋 使用方式

### Google Apps Script 測試

在 Google Sheets 中開啟 Apps Script 編輯器，執行：
- `testWrite()` - 測試表單資料寫入功能
- `createSummarySheet()` - 建立統計報表工作表

## 📊 數據結構

### 表單提交資料格式

```javascript
{
  timestamp: "2024-12-17 下午 3:36",
  requester: "王小明",
  bulbType: "一般燈",
  locations: [
    {
      category: "公共區域",
      location: "警衛室備用",
      quantity: 5
    }
  ],
  totalQuantity: 5
}
```

### Google Sheets 記錄結構

| 時間 | 領用人 | 區域分類 | 詳細位置 | 一般燈 | 感應燈 |
|------|--------|--------|--------|--------|--------|
| 2024-12-17 下午 3:36 | 王小明 | 公共區域 | 警衛室備用 | 5 | 0 |

## 🛠️ 檔案說明

- `index.html` - 前端表單頁面
- `script.js` - 前端邏輯（含表單驗證和 API 呼叫）
- `styles.css` - 前端樣式
- `Code.gs` - Google Apps Script 後端（含資料寫入和驗證邏輯）
- `README.md` - 本文件

## ⚠️ 重要注意事項

1. **安全參數** - 必須在 `Code.gs` 和 `script.js` 中設定一致的參數名稱和值
2. **URL 編碼** - 安全參數值會被自動 URL 編碼傳送
3. **時區設定** - 預設為 Asia/Taipei（台北時區）
4. **CORS 限制** - 使用 no-cors 模式避免跨域問題
5. **敏感資訊** - 部署前務必替換所有佔位符（YOUR_*）

## 🔍 故障排查

### 提交失敗

1. 開啟瀏覽器 Console (F12) 查看詳細錯誤訊息
2. 確認 Google Apps Script URL 正確且已部署
3. 確認安全參數已正確傳遞
4. 查看 Google Apps Script 執行日誌

### 資料未出現在 Google Sheets

1. 檢查工作表 "燈泡使用登記表" 是否存在
2. 在 Apps Script 編輯器執行 `testWrite()` 進行測試
3. 檢查 Apps Script 的執行日誌查看詳細錯誤

---

**最後更新**: 2024-12-17

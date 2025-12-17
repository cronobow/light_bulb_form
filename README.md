# 燈泡領用登記表

一個用於登記領用燈泡的網頁表單系統，支援多個使用位置的 nested form，並可將資料自動傳送到 Google Sheets 進行統計。

## 功能特色

- ✅ 記錄領用人資訊
- ✅ 選擇燈泡種類（含自訂選項）
- ✅ 動態新增多個使用位置（Nested Form）
- ✅ 自動計算總領用數量
- ✅ 資料傳送至 Google Sheets
- ✅ 響應式設計，支援手機與平板
- ✅ 可發布到 GitHub Pages

## 檔案結構

```
forms/
├── index.html      # 主要表單頁面
├── styles.css      # 樣式表
├── script.js       # JavaScript 邏輯
├── Code.gs         # Google Apps Script 後端
└── README.md       # 說明文件
```

## 快速開始

### 1. 設定 Google Sheets

#### 步驟 1: 建立 Google Sheet
1. 前往 [Google Sheets](https://sheets.google.com)
2. 建立新試算表
3. 將試算表命名為「燈泡領用登記表」

#### 步驟 2: 設定 Google Apps Script
1. 在試算表中，點選「擴充功能」→「Apps Script」
2. 刪除預設的 `myFunction()`
3. 複製 `Code.gs` 的內容貼上
4. 點選「部署」→「新增部署作業」
5. 選擇類型：「網頁應用程式」
6. 設定：
   - 執行身分：「我」
   - 存取權：「所有人」
7. 點選「部署」
8. **複製 Web App URL**（很重要！）

#### 步驟 3: 更新前端設定
1. 開啟 `script.js`
2. 找到第 2 行：
   ```javascript
   const GOOGLE_SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. 將 `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` 替換成你的 Web App URL

### 2. 本地測試

直接用瀏覽器開啟 `index.html` 即可測試。

### 3. 發布到 GitHub Pages

#### 步驟 1: 建立 GitHub 儲存庫
```bash
git init
git add .
git commit -m "Initial commit: Light bulb requisition form"
git branch -M main
git remote add origin https://github.com/你的用戶名/forms.git
git push -u origin main
```

#### 步驟 2: 啟用 GitHub Pages
1. 前往你的 GitHub 儲存庫
2. 點選「Settings」
3. 左側選單點選「Pages」
4. Source 選擇「main」分支
5. 資料夾選擇「/ (root)」
6. 點選「Save」
7. 等待幾分鐘後，你的網站將發布在：`https://你的用戶名.github.io/forms/`

## 使用說明

1. **填寫領用人**：輸入領用者姓名
2. **選擇燈泡種類**：從下拉選單選擇，或選「其他」自行輸入
3. **新增使用位置**：
   - 預設有一個位置欄位
   - 點選「+ 新增位置」可新增更多位置
   - 每個位置可填寫地點名稱和數量
   - 點選「移除」可刪除該位置
4. **查看總計**：系統會自動計算所有位置的總數量
5. **提交**：點選「提交登記」送出資料

## 資料格式

資料會以下列格式儲存到 Google Sheets：

| 時間 | 領用人 | 燈泡種類 | 位置 | 數量 | 總計 |
|------|--------|----------|------|------|------|
| 2024-01-01 10:30 | 張三 | LED-10W | 辦公室 | 5 | 10 |
| 2024-01-01 10:30 | 張三 | LED-10W | 倉庫 | 5 | 10 |

每個位置會產生一筆記錄，總計欄位顯示該次領用的總數量。

## 安全性考量與建議

### ⚠️ 重要安全提醒

1. **Google Apps Script 權限**
   - 目前設定為「所有人」可存取 Web App
   - ✅ **建議**：在 Apps Script 中加入基本驗證機制
   - ✅ **建議**：限制來源網域（CORS）
   - ✅ **建議**：加入 rate limiting 防止濫用

2. **資料驗證**
   - ✅ 前端已有基本驗證（必填欄位、數字範圍）
   - ✅ 後端 Google Apps Script 也有資料驗證
   - ⚠️ **注意**：前端驗證可被繞過，後端驗證是關鍵

3. **敏感資訊**
   - ⚠️ 目前沒有加密傳輸（使用 HTTPS 即可）
   - ✅ GitHub Pages 預設支援 HTTPS
   - ⚠️ **建議**：不要在表單中收集個人敏感資訊（身分證、電話等）

4. **存取控制**
   - ⚠️ 任何人都可以提交表單
   - ✅ **建議改善方案**：
     - 加入簡單的密碼保護
     - 使用 Google 帳號登入
     - 限制內網存取

5. **防止濫用**
   - ⚠️ 目前沒有 rate limiting
   - ✅ **建議**：在 Google Apps Script 中加入提交次數限制

### 建議的安全改善（可選）

#### 選項 1: 加入簡單密碼保護
在 `Code.gs` 中加入：
```javascript
const VALID_PASSWORD = 'your_password_here';

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  
  if (data.password !== VALID_PASSWORD) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: '密碼錯誤'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // ... 原本的處理邏輯
}
```

#### 選項 2: 限制存取來源
在 `Code.gs` 中加入：
```javascript
const ALLOWED_ORIGINS = [
  'https://你的用戶名.github.io',
  'http://localhost' // 本地測試用
];

function doPost(e) {
  const origin = e.parameter.origin || '';
  
  if (!ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))) {
    return ContentService.createTextOutput('Forbidden');
  }
  
  // ... 原本的處理邏輯
}
```

#### 選項 3: 使用 Google 登入
這需要更複雜的設定，但可提供最好的安全性。

## 技術細節

- **前端**：純 HTML/CSS/JavaScript，無需任何框架
- **後端**：Google Apps Script
- **資料庫**：Google Sheets
- **部署**：GitHub Pages（靜態網站託管）

## 瀏覽器支援

- ✅ Chrome (推薦)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ 行動裝置瀏覽器

## 疑難排解

### 問題：提交後沒有反應
- 檢查 `script.js` 中的 `GOOGLE_SHEET_URL` 是否正確設定
- 開啟瀏覽器開發者工具（F12）查看 Console 錯誤訊息
- 確認 Google Apps Script 已正確部署

### 問題：資料沒有寫入 Google Sheets
- 檢查 Google Apps Script 的權限設定
- 確認試算表名稱是否為「燈泡領用登記表」
- 查看 Apps Script 的執行記錄（Executions）

### 問題：GitHub Pages 無法顯示
- 等待 5-10 分鐘讓 GitHub 建置網站
- 檢查儲存庫設定中的 Pages 設定是否正確
- 確認檔案都已正確推送到 GitHub

## 授權

MIT License - 可自由使用、修改和分發

## 貢獻

歡迎提交 Issue 或 Pull Request！

## 聯絡資訊

如有問題或建議，請開 Issue 討論。

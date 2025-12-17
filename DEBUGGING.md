# 🔍 Google Sheet 沒資料？診斷指南

## ⚡ 快速診斷步驟

### 步驟 1：檢查前端是否有發送請求

1. **打開表單頁面** (index.html)
2. **按 F12 開啟開發者工具**
3. **切換到 Console 頁籤**
4. **填寫表單並點擊「提交登記」**
5. **查看 Console 中的訊息**

應該會看到類似這樣的日誌：
```
========== 開始提交表單 ==========
時間: 2025-12-17 13:54:19
領用人: 總幹事
燈泡種類: 一般燈
位置數量: 2
各位置詳情:
  位置 1: 分類="公共區域", 位置="警衛室備用", 數量=5
  位置 2: 分類="A棟", 位置="A棟1樓", 數量=3
總計: 8
完整提交資料:
{...完整 JSON...}
Google Apps Script URL: https://script.google.com/macros/s/AKfycbz...
開始發送請求...
✓ 請求已發送（使用 no-cors 模式）
========== 提交完成 ==========
```

**問題診斷：**
- ❌ 看不到日誌？ → 前端 `script.js` 沒有正確載入
- ❌ 看到「Google Sheets URL 尚未設定」？ → 需要更新 `script.js` 中的 `GOOGLE_SHEET_URL`
- ❌ 看到「請求已發送」但 Google Sheets 沒資料？ → 問題在後端，進行步驟 2

---

### 步驟 2：檢查後端是否有收到請求

1. **開啟 Google Apps Script 編輯器**
   - 在 Google Sheets 中：點選「擴充功能」→「Apps Script」

2. **點選「執行記錄」** (左下角的執行記錄圖示 📋)

3. **查看最新的執行記錄**
   - 應該會看到時間戳記
   - 查看「狀態」欄位：
     - ✓ 完成 = 成功
     - ❌ 時間已超期 = 執行失敗
     - ⚠️ 已暫停 = 權限問題

4. **點擊執行記錄查看詳細日誌**

應該會看到類似這樣的日誌：
```
========== 開始處理表單提交 ==========
時間戳記: 2025-12-17 13:54:19
接收到的原始資料: {"timestamp":"2025-12-17 13:54:19",...}
領用人: 總幹事
燈泡種類: 一般燈
位置數量: 2
總計: 8
試算表ID: 1a2b3c4d5e...
試算表名稱: 燈泡領用登記表
尋找工作表: 燈泡使用登記表
✓ 資料驗證通過
開始驗證位置資訊...
位置 1: category="公共區域", location="警衛室備用", quantity=5
位置 2: category="A棟", location="A棟1樓", quantity=3
✓ 所有位置資訊驗證通過
開始寫入資料到試算表...
寫入第 1 筆: [2025-12-17 13:54:19, 總幹事, 一般燈, 公共區域, 警衛室備用, 5, 8]
寫入第 2 筆: [2025-12-17 13:54:19, 總幹事, 一般燈, A棟, A棟1樓, 3, 8]
✓ 成功寫入 2 筆記錄
已調整欄寬
========== 提交完成 ==========
```

**問題診斷：**

| 症狀 | 原因 | 解決方案 |
|------|------|--------|
| 看不到執行記錄 | 未點擊提交或 Google Apps Script 未部署 | 檢查是否正確部署，重新提交一次 |
| `❌ 發生錯誤` | Apps Script 程式碼有問題 | 點擊錯誤訊息查看詳細錯誤 |
| `❌ 資料驗證失敗` | 前端傳來的資料不完整 | 檢查前端 Console 確認資料內容 |
| `❌ 時間已超期` | 執行時間過長或權限不足 | 檢查 Google Sheets 權限或試算表名稱 |
| 顯示 `✓ 完成` 但 Google Sheets 沒資料 | 試算表名稱不符或權限問題 | 見步驟 3 |

---

### 步驟 3：檢查 Google Sheets 設定

1. **確認試算表名稱是否為「燈泡使用登記表」**
   - 打開你的 Google Sheets
   - 查看工作表標籤（底部）
   - 應該有名為「燈泡使用登記表」的工作表

   如果沒有 → 表示資料沒有正確寫入，檢查步驟 2 的錯誤訊息

2. **確認 Google Apps Script 權限**
   - 在 Google Apps Script 編輯器
   - 點選「部署」→「管理部署」
   - 確認「執行身分」為「我」
   - 確認「存取權」為「所有人」

3. **檢查 Google Sheets 的編輯權限**
   - 確認你的 Google 帳號有編輯該試算表的權限

---

### 步驟 4：使用除錯工具

我們提供了一個除錯工具來快速測試：

1. **打開 debug.html**
   ```
   /Users/max/maxlab/forms/debug.html
   ```

2. **設定 Web App URL**
   - 在「設定 Web App URL」區域輸入你的 Google Apps Script URL
   - 點選「保存 URL」

3. **測試連線**
   - 點選「檢查連線」
   - 應該看到「連線成功」

4. **發送測試資料**
   - 點選「載入範例資料」
   - 點選「發送測試請求」
   - 檢查是否收到成功訊息

5. **查看後端日誌**
   - 打開 Google Apps Script 執行記錄
   - 查看是否有對應的日誌

---

## 🚨 常見問題與解決方案

### Q1：看不到任何日誌

**可能原因：**
- script.js 沒有正確載入
- 打錯了 Web App URL

**解決方案：**
1. 重新整理頁面（Ctrl+F5）
2. 確認瀏覽器的開發者工具已開啟（F12）
3. 檢查 script.js 第 2 行的 GOOGLE_SHEET_URL 是否正確

---

### Q2：看到「資料驗證失敗」

**可能原因：**
- 前端沒有正確蒐集位置資訊
- category 或 location 欄位為空

**解決方案：**
1. 檢查前端 Console 中的完整提交資料
2. 確認你選擇了「區域分類」和「詳細位置」
3. 確認輸入了「數量」

---

### Q3：看到「未找到工作表」錯誤

**可能原因：**
- Code.gs 中的工作表名稱與實際 Google Sheets 中的名稱不符

**解決方案：**
1. 檢查 Google Sheets 中工作表的名稱
2. 如果名稱不是「燈泡使用登記表」，在 Code.gs 中修改對應的名稱
3. 重新部署 Apps Script

---

### Q4：Google Apps Script 顯示「時間已超期」

**可能原因：**
- Google Sheets 權限不足
- 試算表損毀或無法存取

**解決方案：**
1. 檢查你是否有編輯該 Google Sheets 的權限
2. 嘗試手動在 Google Sheets 中新增一列
3. 如果仍無法新增，嘗試建立新的 Google Sheets 並重新部署

---

### Q5：提交後看到「發送成功」但 Google Sheets 仍無資料

**可能原因：**
- 資料確實已寫入，但在不同的工作表或位置
- 資料寫入但 Google Sheets 沒有重新整理

**解決方案：**
1. 在 Google Sheets 中按 F5 重新整理
2. 檢查所有工作表標籤
3. 查看「燈泡使用登記表」工作表的最後幾行
4. 如果還是找不到，使用 Ctrl+F 搜尋你輸入的領用人名稱

---

## 🛠️ 高級診斷

### 方法 1：在 Google Apps Script 中手動執行

1. 打開 Google Apps Script 編輯器
2. 在編輯器中複製下方程式碼，在頂部新增一個測試函數：

```javascript
function testManually() {
  const testData = {
    timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    requester: '測試用',
    bulbType: '一般燈',
    locations: [
      { category: '公共區域', location: '警衛室備用', quantity: 1 }
    ],
    totalQuantity: 1
  };
  
  // 模擬 doPost 呼叫
  const fakeEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(fakeEvent);
  Logger.log('測試結果: ' + result.getContent());
}
```

3. 選擇 `testManually` 函數
4. 點選執行（▶）
5. 查看執行記錄確認是否成功

---

### 方法 2：檢查 Google Sheets API 額度

1. 前往 [Google Cloud Console](https://console.cloud.google.com)
2. 選擇你的專案
3. 點選「API 和服務」→「配額」
4. 搜尋「Google Sheets API」
5. 確認使用額度未超限

---

## 📞 仍無法解決？

請收集以下資訊並提供：

1. **前端 Console 的完整日誌**（截圖或複製）
2. **Google Apps Script 執行記錄的完整日誌**（截圖或複製）
3. **Google Sheets 試算表中工作表的名稱清單**
4. **Google Apps Script 的部署狀態**（是否已部署、Web App URL 是否正確）

---

祝你順利診斷問題！ 🚀

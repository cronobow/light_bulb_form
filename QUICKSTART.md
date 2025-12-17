# 快速開始指南

## 5 分鐘內完成設定！

### 步驟 1: 建立 Google Sheet（2 分鐘）

1. 前往 https://sheets.google.com
2. 點選「空白試算表」
3. 將試算表命名為「燈泡領用登記表」

### 步驟 2: 設定 Google Apps Script（2 分鐘）

1. 在試算表中，點選「擴充功能」→「Apps Script」
2. 刪除預設程式碼
3. 開啟 `Code.gs` 檔案，複製全部內容
4. 貼到 Apps Script 編輯器中
5. 點選「部署」→「新增部署作業」
6. 類型選擇：「網頁應用程式」
7. 設定：
   - 執行身分：選「我」
   - 存取權：選「所有人」
8. 點選「部署」
9. **複製 Web App URL**（非常重要！）

### 步驟 3: 更新前端設定（1 分鐘）

1. 開啟 `script.js` 檔案
2. 找到第 2 行：
   ```javascript
   const GOOGLE_SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. 把 `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` 替換成你剛才複製的 URL
4. 儲存檔案

### 步驟 4: 測試（1 分鐘）

1. 用瀏覽器開啟 `index.html`
2. 填寫表單並提交
3. 檢查 Google Sheets 是否有資料

### 完成！🎉

現在你可以：
- 分享這個網頁給同事使用（本地）
- 或繼續下一步：發布到 GitHub Pages

---

## 發布到 GitHub Pages（5 分鐘）

### 前提
- 需要 GitHub 帳號
- 已安裝 Git

### 步驟

1. **建立 GitHub 儲存庫**
   ```bash
   # 在專案資料夾中
   git remote add origin https://github.com/你的用戶名/forms.git
   git push -u origin main
   ```

2. **啟用 GitHub Pages**
   - 前往 https://github.com/你的用戶名/forms
   - 點選「Settings」
   - 左側選「Pages」
   - Source 選「main」分支
   - 資料夾選「/ (root)」
   - 點選「Save」

3. **等待部署**
   - 等待 5-10 分鐘
   - 訪問 `https://你的用戶名.github.io/forms/`

4. **完成！**
   - 現在任何人都可以透過網址存取你的表單

---

## 常見問題

### Q: 提交後沒反應？
- 檢查瀏覽器 Console（F12）是否有錯誤
- 確認 `script.js` 中的 URL 是否正確
- 確認 Google Apps Script 已部署

### Q: 資料沒寫入 Google Sheets？
- 檢查 Apps Script 權限
- 確認試算表名稱是「燈泡領用登記表」
- 查看 Apps Script 的執行記錄

### Q: GitHub Pages 無法顯示？
- 等待 5-10 分鐘
- 檢查 Settings → Pages 設定
- 確認所有檔案都已推送

---

## 下一步

- 📖 閱讀 [README.md](README.md) 了解完整功能
- 🔒 閱讀 [SECURITY.md](SECURITY.md) 了解資安建議
- 🎨 自訂 `styles.css` 修改外觀
- 🔧 修改 `index.html` 調整表單欄位

---

## 需要幫助？

如有問題，請參考：
1. README.md 的「疑難排解」章節
2. GitHub Issues
3. Google Apps Script 說明文件

祝使用愉快！✨

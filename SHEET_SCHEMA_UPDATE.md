# 📊 Google Sheets 結構更新說明

## 變更內容

Google Sheets 的欄位結構已修改為分離燈泡種類，便於統計計算。

### 舊結構（7 欄）
```
時間 | 領用人 | 燈泡種類 | 區域分類 | 詳細位置 | 數量 | 總計
```

### 新結構（6 欄）
```
時間 | 領用人 | 區域分類 | 詳細位置 | 一般燈 | 感應燈
```

---

## 優勢

### ✅ 便於統計
- 可直接對「一般燈」欄位求和
- 可直接對「感應燈」欄位求和
- 使用 SUMIF() 公式更簡單

### ✅ 資料結構清晰
- 不再需要「燈泡種類」欄位（用欄位名稱區分）
- 每筆資料一行，符合資料庫正規化

---

## 統計公式示例

### 一般燈總數
```
=SUM(E2:E100)
```

### 感應燈總數
```
=SUM(F2:F100)
```

### 按領用人統計一般燈
```
=SUMIF(B2:B100, "總幹事", E2:E100)
```

### 按領用人統計感應燈
```
=SUMIF(B2:B100, "秘書", F2:F100)
```

### 按區域統計一般燈
```
=SUMIF(C2:C100, "公共區域", E2:E100)
```

---

## 如何應用此更新

### 步驟 1：更新 Code.gs

複製以下程式碼到你的 Google Apps Script：

**表頭設定（第 39 行）：**
```javascript
sheet.appendRow(['時間', '領用人', '區域分類', '詳細位置', '一般燈', '感應燈']);
```

**工作表建立時（第 116 行）：**
```javascript
sheet.appendRow(['時間', '領用人', '區域分類', '詳細位置', '一般燈', '感應燈']);
sheet.getRange('A1:F1').setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
```

**欄寬設定（第 42, 121 行）：**
```javascript
const columnWidths = [160, 120, 100, 150, 80, 80];
```

**寫入資料邏輯（第 152-181 行）：**
```javascript
// 根據燈泡種類決定哪個欄位記錄數量
let generalBulbQty = 0;
let sensorBulbQty = 0;

if (data.bulbType === '一般燈') {
  generalBulbQty = location.quantity;
} else if (data.bulbType === '感應燈') {
  sensorBulbQty = location.quantity;
}

const row = [
  data.timestamp,
  data.requester,
  location.category,
  location.location,
  generalBulbQty,
  sensorBulbQty
];
sheet.appendRow(row);
```

### 步驟 2：保存並重新部署

1. 保存 Code.gs
2. 部署為新版本
3. 創建新的工作表或清空舊的資料

### 步驟 3：測試

使用表單提交一筆資料，驗證 Google Sheets 中的記錄格式是否正確。

---

## ⚠️ 重要提醒

### 舊資料處理

如果已有舊的紀錄（7 欄格式），有兩種選擇：

#### 選項 1：保留舊資料，新建工作表
```
舊工作表：燈泡使用登記表（保持原樣）
新工作表：燈泡使用登記表 v2（使用新結構）
```

#### 選項 2：清空並重新開始
1. 刪除舊資料
2. 保持同一個工作表
3. 使用新的欄位結構

---

## 📈 統計報表範例

建立「統計報表」工作表，使用以下公式：

### 按燈泡種類統計
```
=QUERY(燈泡使用登記表!A:F, "SELECT E, F LABEL E '一般燈', F '感應燈'")
```

### 按領用人統計
```
=QUERY(燈泡使用登記表!A:F, "SELECT B, SUM(E), SUM(F) GROUP BY B LABEL B '領用人', SUM(E) '一般燈總數', SUM(F) '感應燈總數'")
```

### 按區域統計
```
=QUERY(燈泡使用登記表!A:F, "SELECT C, SUM(E), SUM(F) GROUP BY C LABEL C '區域', SUM(E) '一般燈總數', SUM(F) '感應燈總數'")
```

---

## ✅ 驗證清單

更新完成後，請確認：

- [ ] Code.gs 已更新所有欄位設定
- [ ] 已保存並重新部署
- [ ] 新工作表建立時自動生成正確的表頭
- [ ] 提交表單資料成功寫入
- [ ] 可以對「一般燈」和「感應燈」欄位分別統計
- [ ] 統計公式正常運作

---

更新日期：2024-12-17

**現在可以根據燈泡種類輕鬆進行統計！** 📊

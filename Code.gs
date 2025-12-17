// Google Apps Script 後端程式碼
// 用於接收表單資料並寫入 Google Sheets

function doPost(e) {
  try {
    // 解析接收到的資料
    const data = JSON.parse(e.postData.contents);
    
    // 詳細除錯日誌
    Logger.log('========== 開始處理表單提交 ==========');
    Logger.log('時間戳記: ' + new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }));
    Logger.log('接收到的原始資料: ' + JSON.stringify(data));
    Logger.log('領用人: ' + data.requester);
    Logger.log('燈泡種類: ' + data.bulbType);
    Logger.log('位置數量: ' + (data.locations ? data.locations.length : '未定義'));
    Logger.log('總計: ' + data.totalQuantity);

    // 取得試算表
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('試算表ID: ' + ss.getId());
    Logger.log('試算表名稱: ' + ss.getName());
    
    let sheet = ss.getSheetByName('燈泡使用登記表');
    Logger.log('尋找工作表: 燈泡使用登記表');

    // 如果工作表不存在，建立新的
    if (!sheet) {
      Logger.log('工作表不存在，正在建立新工作表...');
      sheet = ss.insertSheet('燈泡使用登記表');
      // 建立標題列
      sheet.appendRow(['時間', '領用人', '燈泡種類', '區域分類', '詳細位置', '數量', '總計']);
      sheet.getRange('A1:G1').setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      Logger.log('新工作表已建立');
    } else {
      Logger.log('工作表已存在，當前行數: ' + sheet.getLastRow());
    }

    // 資料驗證
    if (!data.requester || !data.bulbType || !data.locations || data.locations.length === 0) {
      Logger.log('❌ 資料驗證失敗 - 資料不完整');
      Logger.log('requester: ' + data.requester);
      Logger.log('bulbType: ' + data.bulbType);
      Logger.log('locations: ' + JSON.stringify(data.locations));
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: '資料不完整'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    Logger.log('✓ 資料驗證通過');

    // 驗證位置資訊
    Logger.log('開始驗證位置資訊...');
    for (let i = 0; i < data.locations.length; i++) {
      let location = data.locations[i];
      Logger.log(`位置 ${i + 1}: category="${location.category}", location="${location.location}", quantity=${location.quantity}`);
      
      if (!location.category || !location.location || !location.quantity || location.quantity < 1) {
        Logger.log(`❌ 位置 ${i + 1} 驗證失敗`);
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: '位置或數量資料不正確'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    Logger.log('✓ 所有位置資訊驗證通過');

    // 將每個位置作為一筆記錄寫入
    Logger.log('開始寫入資料到試算表...');
    data.locations.forEach((location, index) => {
      const newRow = [
        data.timestamp,
        data.requester,
        data.bulbType,
        location.category,
        location.location,
        location.quantity,
        data.totalQuantity
      ];
      
      Logger.log(`寫入第 ${index + 1} 筆: [${newRow.join(', ')}]`);
      sheet.appendRow(newRow);
    });

    Logger.log(`✓ 成功寫入 ${data.locations.length} 筆記錄`);

    // 自動調整欄寬
    sheet.autoResizeColumns(1, 7);
    Logger.log('已調整欄寬');

    Logger.log('========== 提交完成 ==========\n');

    // 回傳成功訊息
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: '資料已成功儲存'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 錯誤處理
    Logger.log('========== ❌ 發生錯誤 ==========');
    Logger.log('錯誤訊息: ' + error.toString());
    Logger.log('錯誤堆疊: ' + error.stack);
    Logger.log('========== 錯誤處理結束 ==========\n');
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: '伺服器錯誤：' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 測試用函數（可選）
function doGet(e) {
  return ContentService.createTextOutput('燈泡使用登記表系統 API 正在運行中 - ' + new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }));
}

// 查看最近的執行日誌
function viewLogs() {
  Logger.log('查看最近執行記錄...');
  // 執行記錄可在 Google Apps Script 編輯器的「執行記錄」查看
}

// 建立統計工作表的函數（可選）
function createSummarySheet() {
  try {
    Logger.log('開始建立統計報表...');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let summarySheet = ss.getSheetByName('統計報表');

    if (!summarySheet) {
      Logger.log('統計報表不存在，正在建立...');
      summarySheet = ss.insertSheet('統計報表');
    }

    // 清空現有內容
    summarySheet.clear();

    // 建立標題
    summarySheet.appendRow(['統計報表', '', '', '']);
    summarySheet.getRange('A1:D1').merge().setFontSize(16).setFontWeight('bold').setHorizontalAlignment('center');

    summarySheet.appendRow([]);
    summarySheet.appendRow(['依燈泡種類統計']);

    // 使用 QUERY 函數統計
    const dataSheet = ss.getSheetByName('燈泡使用登記表');
    if (dataSheet && dataSheet.getLastRow() > 1) {
      const query1 = '=QUERY(燈泡使用登記表!A:G, "SELECT C, SUM(F) GROUP BY C LABEL C \'燈泡種類\', SUM(F) \'總數量\'", 1)';
      summarySheet.getRange('A4').setFormula(query1);

      summarySheet.appendRow([]);
      summarySheet.appendRow([]);
      summarySheet.appendRow(['依領用人統計']);
      const query2 = '=QUERY(燈泡使用登記表!A:G, "SELECT B, COUNT(B), SUM(F) GROUP BY B LABEL B \'領用人\', COUNT(B) \'領用次數\', SUM(F) \'總數量\'", 1)';
      summarySheet.getRange('A8').setFormula(query2);

      summarySheet.appendRow([]);
      summarySheet.appendRow([]);
      summarySheet.appendRow(['依區域分類統計']);
      const query3 = '=QUERY(燈泡使用登記表!A:G, "SELECT D, SUM(F) GROUP BY D LABEL D \'區域\', SUM(F) \'總數量\'", 1)';
      summarySheet.getRange('A12').setFormula(query3);

      summarySheet.appendRow([]);
      summarySheet.appendRow([]);
      summarySheet.appendRow(['依詳細位置統計']);
      const query4 = '=QUERY(燈泡使用登記表!A:G, "SELECT D, E, SUM(F) GROUP BY D, E LABEL D \'區域\', E \'位置\', SUM(F) \'總數量\'", 1)';
      summarySheet.getRange('A16').setFormula(query4);

      Logger.log('統計公式已設置');
    }

    // 格式化
    summarySheet.autoResizeColumns(1, 4);

    Logger.log('✓ 統計報表建立完成');
    return '統計報表已建立';
  } catch (error) {
    Logger.log('❌ 建立統計報表失敗: ' + error.toString());
    return '建立失敗: ' + error.toString();
  }
}

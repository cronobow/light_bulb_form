// Google Apps Script 後端程式碼 - 簡化測試版本
// 用於接收表單資料並寫入 Google Sheets

// 簡單的測試函數 - 直接在 Apps Script 編輯器執行
function testWrite() {
  try {
    Logger.log('========== 測試寫入功能 ==========');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('試算表: ' + ss.getName());
    
    let sheet = ss.getSheetByName('燈泡使用登記表');
    if (!sheet) {
      Logger.log('建立新工作表...');
      sheet = ss.insertSheet('燈泡使用登記表');
      sheet.appendRow(['時間', '領用人', '燈泡種類', '區域分類', '詳細位置', '數量', '總計']);
    }
    
    // 寫入測試資料
    const testRow = [
      new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
      '測試用',
      '一般燈',
      '公共區域',
      '警衛室備用',
      '5',
      '5'
    ];
    sheet.appendRow(testRow);
    Logger.log('✓ 測試資料已寫入');
    Logger.log('========== 測試完成 ==========');
  } catch (error) {
    Logger.log('❌ 錯誤: ' + error.toString());
  }
}

// 主函數 - 接收 POST 請求
function doPost(e) {
  try {
    Logger.log('========== 開始處理表單提交 ==========');
    Logger.log('時間: ' + new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }));
    
    // 解析接收到的資料
    let data;
    try {
      data = JSON.parse(e.postData.contents);
      Logger.log('✓ JSON 解析成功');
    } catch (parseError) {
      Logger.log('❌ JSON 解析失敗: ' + parseError.toString());
      Logger.log('原始資料: ' + e.postData.contents);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'JSON 格式錯誤: ' + parseError.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    Logger.log('接收到的資料:');
    Logger.log('  領用人: ' + data.requester);
    Logger.log('  燈泡種類: ' + data.bulbType);
    Logger.log('  位置數量: ' + (data.locations ? data.locations.length : '0'));
    Logger.log('  總計: ' + data.totalQuantity);

    // 取得試算表
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('試算表: ' + ss.getName());
    
    // 取得或建立工作表
    let sheet = ss.getSheetByName('燈泡使用登記表');
    if (!sheet) {
      Logger.log('工作表不存在，正在建立...');
      sheet = ss.insertSheet('燈泡使用登記表');
      sheet.appendRow(['時間', '領用人', '燈泡種類', '區域分類', '詳細位置', '數量', '總計']);
      sheet.getRange('A1:G1').setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      Logger.log('✓ 新工作表已建立');
    }

    // 基本驗證
    if (!data.requester || !data.bulbType || !data.locations || data.locations.length === 0) {
      Logger.log('❌ 資料驗證失敗');
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: '資料不完整'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 驗證每個位置
    for (let i = 0; i < data.locations.length; i++) {
      const loc = data.locations[i];
      if (!loc.category || !loc.location || !loc.quantity) {
        Logger.log('❌ 位置 ' + (i + 1) + ' 資料不完整');
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: '位置資料不完整'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // 寫入資料
    Logger.log('開始寫入資料...');
    let writeCount = 0;
    data.locations.forEach((location, index) => {
      try {
        const row = [
          data.timestamp,
          data.requester,
          data.bulbType,
          location.category,
          location.location,
          location.quantity,
          data.totalQuantity
        ];
        sheet.appendRow(row);
        Logger.log('✓ 第 ' + (index + 1) + ' 筆資料已寫入');
        writeCount++;
      } catch (writeError) {
        Logger.log('❌ 第 ' + (index + 1) + ' 筆寫入失敗: ' + writeError.toString());
      }
    });

    // 自動調整欄寬
    try {
      sheet.autoResizeColumns(1, 7);
      Logger.log('✓ 欄寬已調整');
    } catch (e) {
      Logger.log('⚠️ 欄寬調整失敗（非關鍵）: ' + e.toString());
    }

    Logger.log('✓ 成功寫入 ' + writeCount + ' 筆記錄');
    Logger.log('========== 提交完成 ==========');

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: '資料已成功儲存 - 共 ' + writeCount + ' 筆',
      count: writeCount
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('========== ❌ 發生錯誤 ==========');
    Logger.log('錯誤訊息: ' + error.toString());
    Logger.log('錯誤行號: ' + error.lineNumber);
    Logger.log('========== 錯誤處理結束 ==========');
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: '伺服器錯誤: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 測試函數
function doGet(e) {
  try {
    Logger.log('GET 請求已接收');
    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Google Apps Script 已正確部署',
      time: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput('錯誤: ' + error.toString());
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

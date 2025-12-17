// Google Apps Script 後端程式碼
// 用於接收表單資料並寫入 Google Sheets

function doPost(e) {
  try {
    // 解析接收到的資料
    const data = JSON.parse(e.postData.contents);
    
    // 取得試算表
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('燈泡領用登記');
    
    // 如果工作表不存在，建立新的
    if (!sheet) {
      sheet = ss.insertSheet('燈泡領用登記');
      // 建立標題列
      sheet.appendRow(['時間', '領用人', '燈泡種類', '位置', '數量', '總計']);
      sheet.getRange('A1:F1').setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
    
    // 資料驗證
    if (!data.requester || !data.bulbType || !data.locations || data.locations.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: '資料不完整'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 驗證數量
    for (let location of data.locations) {
      if (!location.location || !location.quantity || location.quantity < 1) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: '位置或數量資料不正確'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // 將每個位置作為一筆記錄寫入
    data.locations.forEach(location => {
      sheet.appendRow([
        data.timestamp,
        data.requester,
        data.bulbType,
        location.location,
        location.quantity,
        data.totalQuantity
      ]);
    });
    
    // 自動調整欄寬
    sheet.autoResizeColumns(1, 6);
    
    // 回傳成功訊息
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: '資料已成功儲存'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // 錯誤處理
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: '伺服器錯誤：' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 測試用函數（可選）
function doGet(e) {
  return ContentService.createTextOutput('燈泡領用登記系統 API 正在運行中');
}

// 建立統計工作表的函數（可選）
function createSummarySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let summarySheet = ss.getSheetByName('統計報表');
  
  if (!summarySheet) {
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
  const dataSheet = ss.getSheetByName('燈泡領用登記');
  if (dataSheet && dataSheet.getLastRow() > 1) {
    const query1 = '=QUERY(燈泡領用登記!A:F, "SELECT C, SUM(E) GROUP BY C LABEL C \'燈泡種類\', SUM(E) \'總數量\'", 1)';
    summarySheet.getRange('A4').setFormula(query1);
    
    summarySheet.appendRow([]);
    summarySheet.appendRow([]);
    summarySheet.appendRow(['依領用人統計']);
    const query2 = '=QUERY(燈泡領用登記!A:F, "SELECT B, COUNT(B), SUM(E) GROUP BY B LABEL B \'領用人\', COUNT(B) \'領用次數\', SUM(E) \'總數量\'", 1)';
    summarySheet.getRange('A8').setFormula(query2);
    
    summarySheet.appendRow([]);
    summarySheet.appendRow([]);
    summarySheet.appendRow(['依使用位置統計']);
    const query3 = '=QUERY(燈泡領用登記!A:F, "SELECT D, SUM(E) GROUP BY D LABEL D \'位置\', SUM(E) \'總數量\'", 1)';
    summarySheet.getRange('A12').setFormula(query3);
  }
  
  // 格式化
  summarySheet.autoResizeColumns(1, 4);
  
  return '統計報表已建立';
}

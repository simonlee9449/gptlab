// GPT Lab - Write API (Google Apps Script)
// 이 스크립트는 쓰기 작업만 처리합니다.

const SPREADSHEET_ID = '1hV8bLhwTI2cBq0Is_mqn_Mt5fPxtGQ3CZ4_naFk3JiY';
const PASSWORD = '3820';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var payload = data.data;
    var password = data.password;

    if (password !== PASSWORD) {
      return createResponse({ success: false, message: 'Incorrect password' });
    }

    var result;
    switch (action) {
      case 'addPublication':
        result = addPublication(payload);
        break;
      case 'updatePublication':
        result = updatePublication(payload);
        break;
      case 'deletePublication':
        result = deletePublication(payload.id);
        break;
      case 'addNews':
        result = addNews(payload);
        break;
      case 'updateNews':
        result = updateNews(payload);
        break;
      case 'deleteNews':
        result = deleteNews(payload.id);
        break;
      default:
        result = { success: false, message: 'Unknown action' };
    }

    return createResponse(result);
  } catch (error) {
    return createResponse({ success: false, message: error.toString() });
  }
}

function doGet(e) {
  return createResponse({ success: true, message: 'GPT Lab API is running' });
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========== Publications ==========

function addPublication(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Publications');

  if (!sheet) {
    sheet = ss.insertSheet('Publications');
    sheet.appendRow(['id', 'year', 'authors', 'title', 'journal', 'details', 'link']);
  }

  var allData = sheet.getDataRange().getValues();
  var maxId = 0;
  for (var i = 1; i < allData.length; i++) {
    if (allData[i][0] > maxId) maxId = allData[i][0];
  }
  var newId = maxId + 1;

  sheet.appendRow([
    newId,
    data.year,
    data.authors,
    data.title,
    data.journal,
    data.details || '',
    data.link || ''
  ]);

  return { success: true, id: newId };
}

function updatePublication(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Publications');

  if (!sheet) {
    return { success: false, message: 'Sheet not found' };
  }

  var allData = sheet.getDataRange().getValues();

  for (var i = 1; i < allData.length; i++) {
    if (allData[i][0] == data.id) {
      var rowNum = i + 1;
      sheet.getRange(rowNum, 2).setValue(data.year);
      sheet.getRange(rowNum, 3).setValue(data.authors);
      sheet.getRange(rowNum, 4).setValue(data.title);
      sheet.getRange(rowNum, 5).setValue(data.journal);
      sheet.getRange(rowNum, 6).setValue(data.details || '');
      sheet.getRange(rowNum, 7).setValue(data.link || '');
      return { success: true };
    }
  }

  return { success: false, message: 'Publication not found' };
}

function deletePublication(id) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Publications');

  if (!sheet) {
    return { success: false, message: 'Sheet not found' };
  }

  var allData = sheet.getDataRange().getValues();

  for (var i = 1; i < allData.length; i++) {
    if (allData[i][0] == id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }

  return { success: false, message: 'Publication not found' };
}

// ========== News ==========

function addNews(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('News');

  if (!sheet) {
    sheet = ss.insertSheet('News');
    sheet.appendRow(['id', 'title', 'description', 'imageUrl', 'date']);
  }

  var allData = sheet.getDataRange().getValues();
  var maxId = 0;
  for (var i = 1; i < allData.length; i++) {
    if (allData[i][0] > maxId) maxId = allData[i][0];
  }
  var newId = maxId + 1;

  sheet.appendRow([
    newId,
    data.title,
    data.description,
    data.imageUrl || '',
    data.date || new Date()
  ]);

  return { success: true, id: newId };
}

function updateNews(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('News');

  if (!sheet) {
    return { success: false, message: 'Sheet not found' };
  }

  var allData = sheet.getDataRange().getValues();

  for (var i = 1; i < allData.length; i++) {
    if (allData[i][0] == data.id) {
      var rowNum = i + 1;
      sheet.getRange(rowNum, 2).setValue(data.title);
      sheet.getRange(rowNum, 3).setValue(data.description);
      sheet.getRange(rowNum, 4).setValue(data.imageUrl || '');
      sheet.getRange(rowNum, 5).setValue(data.date || new Date());
      return { success: true };
    }
  }

  return { success: false, message: 'News not found' };
}

function deleteNews(id) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('News');

  if (!sheet) {
    return { success: false, message: 'Sheet not found' };
  }

  var allData = sheet.getDataRange().getValues();

  for (var i = 1; i < allData.length; i++) {
    if (allData[i][0] == id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }

  return { success: false, message: 'News not found' };
}

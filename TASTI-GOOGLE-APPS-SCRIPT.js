var TAB_NAME = 'Finoveo';

function createOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TAB_NAME);
  if (!sheet) { sheet = ss.getActiveSheet(); }
  return sheet;
}

function getHeaders() {
  var sheet = getSheet();
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function(h) {
    return String(h).trim();
  });
}

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'getLeads';
    if (action === 'getLeads') {
      var offset = parseInt(e.parameter.offset) || 0;
      var limit = parseInt(e.parameter.limit) || 500;
      return createOutput(getLeadsPaginated(offset, limit));
    }
    if (action === 'getCount') {
      return createOutput({ success: true, count: getSheet().getLastRow() - 1 });
    }
    return createOutput({ success: false, error: 'Unknown action' });
  } catch (err) {
    return createOutput({ success: false, error: err.message });
  }
}

function getLeadsPaginated(offset, limit) {
  var sheet = getSheet();
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var totalRows = lastRow - 1;

  if (lastRow < 2) return { success: true, data: [], total: 0, offset: offset, limit: limit };

  var headers = getHeaders();
  var startRow = Math.min(offset + 2, lastRow);
  var numRows = Math.min(limit, lastRow - startRow + 1);

  if (numRows <= 0) return { success: true, data: [], total: totalRows, offset: offset, limit: limit };

  var data = sheet.getRange(startRow, 1, numRows, lastCol).getValues();
  var leads = [];

  for (var i = 0; i < data.length; i++) {
    var lead = {};
    lead['_row'] = startRow + i;

    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      if (val instanceof Date) {
        lead[headers[j]] = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else if (val !== undefined && val !== null && val !== '') {
        lead[headers[j]] = String(val);
      } else {
        lead[headers[j]] = '';
      }
    }

    if (!lead['first_name'] && !lead['last_name'] && !lead['email'] && !lead['full_name']) continue;

    if (!lead['status']) lead['status'] = 'not_contacted';
    if (!lead['linkedin_step']) lead['linkedin_step'] = '0';
    if (!lead['lead_score']) lead['lead_score'] = '0';
    if (!lead['export_status']) lead['export_status'] = 'not_exported';

    leads.push(lead);
  }

  return { success: true, data: leads, total: totalRows, offset: offset, limit: limit };
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;

    if (action === 'updateLead') {
      return createOutput({ success: true, data: updateLead(payload.id, payload.updates) });
    }
    if (action === 'bulkUpdate') {
      return createOutput({ success: true, data: bulkUpdateLeads(payload.updates) });
    }
    if (action === 'addLead') {
      return createOutput({ success: true, data: addLead(payload.lead) });
    }
    if (action === 'deleteLead') {
      return createOutput(deleteLead(payload.id));
    }
    return createOutput({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return createOutput({ success: false, error: err.message });
  }
}

function updateLead(id, updates) {
  var sheet = getSheet();
  var headers = getHeaders();
  var lastRow = sheet.getLastRow();
  var idCol = headers.indexOf('id') + 1;

  if (idCol === 0) throw new Error('No "id" column found');

  var ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
  var targetRow = -1;
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === String(id).trim()) {
      targetRow = i + 2;
      break;
    }
  }
  if (targetRow === -1) throw new Error('Lead not found: ' + id);

  var keys = Object.keys(updates);
  for (var k = 0; k < keys.length; k++) {
    var colIdx = headers.indexOf(keys[k]);
    if (colIdx >= 0) {
      sheet.getRange(targetRow, colIdx + 1).setValue(updates[keys[k]]);
    }
  }

  var tsCol = headers.indexOf('updated_at') + 1;
  if (tsCol > 0) {
    sheet.getRange(targetRow, tsCol).setValue(new Date().toISOString());
  }

  return { id: id, row: targetRow, updated: keys };
}

function bulkUpdateLeads(updatesList) {
  var results = [];
  for (var i = 0; i < updatesList.length; i++) {
    try {
      results.push(updateLead(updatesList[i].id, updatesList[i].updates));
    } catch (err) {
      results.push({ id: updatesList[i].id, error: err.message });
    }
  }
  return results;
}

function addLead(leadData) {
  var sheet = getSheet();
  var headers = getHeaders();

  if (!leadData['id']) leadData['id'] = Utilities.getUuid();
  if (!leadData['created_at']) leadData['created_at'] = new Date().toISOString();
  if (!leadData['updated_at']) leadData['updated_at'] = new Date().toISOString();
  if (!leadData['status']) leadData['status'] = 'not_contacted';
  if (!leadData['linkedin_step']) leadData['linkedin_step'] = '0';
  if (!leadData['lead_score']) leadData['lead_score'] = '0';
  if (!leadData['export_status']) leadData['export_status'] = 'not_exported';

  var row = headers.map(function(col) {
    return leadData[col] || '';
  });

  sheet.appendRow(row);
  return leadData;
}

function deleteLead(id) {
  var sheet = getSheet();
  var headers = getHeaders();
  var lastRow = sheet.getLastRow();
  var idCol = headers.indexOf('id');

  if (idCol === -1) return { success: false, error: 'No id column' };

  var ids = sheet.getRange(2, idCol + 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === String(id).trim()) {
      sheet.deleteRow(i + 2);
      return { success: true, deleted: id };
    }
  }

  return { success: false, error: 'Lead not found' };
}

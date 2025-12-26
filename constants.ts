export const GOOGLE_SCRIPT_CODE = `
// ==========================================
// PASTE THIS INTO YOUR GOOGLE APPS SCRIPT
// ==========================================

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  // Handle CORS
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data');
    if (!sheet) {
      setupSheet(); // Auto-setup if missing
      return response({ status: 'error', message: 'Sheet created. Please retry.' });
    }

    // Parse data
    let params = {};
    if (e.postData && e.postData.contents) {
      params = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      params = e.parameter;
    }

    const action = params.action || 'read';

    if (action === 'read') {
      const rows = sheet.getDataRange().getValues();
      const headers = rows.shift();
      const data = rows.map(row => {
        let obj = {};
        headers.forEach((h, i) => obj[h] = row[i]);
        return obj;
      });
      return response({ status: 'success', data: data });
    }

    if (action === 'create') {
      const data = params.data;
      const newId = Utilities.getUuid();
      const newRow = [newId, data.name, data.role, data.department, data.email, data.status];
      sheet.appendRow(newRow);
      return response({ status: 'success', data: { ...data, id: newId } });
    }

    if (action === 'update') {
      const data = params.data;
      const id = data.id;
      const range = sheet.getDataRange();
      const values = range.getValues();
      // Assuming ID is in column 0 (A)
      const rowIndex = values.findIndex(r => r[0] == id);
      
      if (rowIndex === -1) return response({ status: 'error', message: 'ID not found' });

      // Update row (1-based index)
      const rowNum = rowIndex + 1;
      // [id, name, role, department, email, status]
      const updatedRow = [id, data.name, data.role, data.department, data.email, data.status];
      sheet.getRange(rowNum, 1, 1, updatedRow.length).setValues([updatedRow]);
      
      return response({ status: 'success', data: data });
    }

    if (action === 'delete') {
      const id = params.id;
      const range = sheet.getDataRange();
      const values = range.getValues();
      const rowIndex = values.findIndex(r => r[0] == id);
      
      if (rowIndex === -1) return response({ status: 'error', message: 'ID not found' });
      
      sheet.deleteRow(rowIndex + 1);
      return response({ status: 'success', message: 'Deleted' });
    }

    return response({ status: 'error', message: 'Unknown action' });

  } catch (err) {
    return response({ status: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function response(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Data');
  if (!sheet) {
    sheet = ss.insertSheet('Data');
    sheet.appendRow(['id', 'name', 'role', 'department', 'email', 'status']);
  }
}
`;

export const INITIAL_FORM_STATE = {
  name: '',
  role: '',
  department: '',
  email: '',
  status: 'Active' as const,
};

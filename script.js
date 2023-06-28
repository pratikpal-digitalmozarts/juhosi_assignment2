const { google } = require('googleapis');
const credentials = require('./ptk.json'); // Path to your credentials JSON file
const open = require('openurl');

async function writeToGoogleSpreadsheet(data) {
  try {
    // Authenticate using the credentials
    const auth = new google.auth.GoogleAuth({
        credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Create a Google Sheets client
    const sheets = google.sheets({ version: 'v4', auth });

    // Define the spreadsheet ID and range
    const spreadsheetId = '1tsEgKRtHfZaYo13uoWNF89HIvL14Pt-01X1R69QGVMc';
    const range = 'Sheet1';

    // Convert object data to a 2D array for writing to the spreadsheet
    const values = data.map(obj => Object.values(obj));
    const resource = { values };
    await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
    });
    // Write the data to the spreadsheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource,
    });

    console.log('Data written to the Google Spreadsheet.');
    // const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    // open.open(spreadsheetUrl);
    // var link = "https://docs.google.com/spreadsheets/d/1tsEgKRtHfZaYo13uoWNF89HIvL14Pt-01X1R69QGVMc";
    // window.open(link);
  } catch (error) {
    console.error('Error writing to Google Spreadsheet:', error);
  }
}
module.exports = writeToGoogleSpreadsheet;
// Example object data
const objData = [
    {
      id: 'Id',
      orderListId: 'OrderListID',
      productId: 'productId',
      package: 'package',
      request_weight: 'request_weight',
      result_weight: 'result_weight',
      orderDate: 'orderDate',
      price: 'price',
      order_id: 'order_id'
    },
    {
      id: 36,
      orderListId: 123458,
      productId: 19,
      package: 'Mouse',
      request_weight: 32,
      result_weight: 34,
      orderDate: '2023-06-27T18:30:00.000Z',
      price: null,
      order_id: 145
    },
    {
      id: 37,
      orderListId: 123458,
      productId: 19,
      package: 'Mouse',
      request_weight: 24,
      result_weight: 23,
      orderDate: '2023-06-27T18:30:00.000Z',
      price: null,
      order_id: 145
    },
    {
      id: 38,
      orderListId: 123458,
      productId: 1,
      package: 'mobiles',
      request_weight: 35,
      result_weight: 34,
      orderDate: '2023-06-27T18:30:00.000Z',
      price: null,
      order_id: 145
    },
    {
      id: 39,
      orderListId: 123458,
      productId: 20,
      package: 'Tshirt',
      request_weight: 65,
      result_weight: 60,
      orderDate: '2023-06-27T18:30:00.000Z',
      price: null,
      order_id: 145
    }
  ]

// Call the function with the object data
// writeToGoogleSpreadsheet(objData);

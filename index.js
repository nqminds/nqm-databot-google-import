/**
 * Print the names and majors of students in a sample spreadsheet:
 * @param {Object} auth token
 * @param {String} spreadsheet ID
 * @param {String} sheetname
 * @param {String} dataset ID
 * @param {Object} databot output object
 */
function listSheet(auth, spreadsheetID, sheetname, datasetID, output) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: spreadsheetID,
    range: sheetname,
  }, function(err, response) {
    if (err) {
      output.error('The API returned an error: %s',err);
      process.exit(1);
    }
    var rows = response.values;

    if (rows.length == 0) {
      output.error('Error: No data found.');
	  process.exit(1);
    } else if (rows.length == 1) {
	  output.error('Error: Table has only the header.');
	  process.exit(1);
	} else {
	  var header = [];
	  var datarows = _.drop(rows);
	  var jsonrows = [];

	  _.forEach(rows[0], function(headval){
	    header.push(headval.split("#"));
	  });
		
	  _.forEach(datarows, function(datavalue, i){
 	  	var headerobj = {};

      	_.forEach(header, function(headval, index){
		  if(headval[1]=="string")
          	return headerobj[headval[0]]=datavalue[index]
		  else if(headval[1]=="number")
	        return headerobj[headval[0]]=Number(datavalue[index])
      	});
		output.progress(100 * i/(rows.length-2));
		jsonrows.push(headerobj);
	  });

      nqmindsTDX.truncateDataset(datasetID, function(errTruncate, resTruncate) {
	    if(errTruncate) {
		  output.error("Error truncate: %s", errTruncate);
		  process.exit(1);
		} else {
		  nqmindsTDX.addDatasetData(datasetID, jsonrows, function(errAdd, resAdd) {
		    if(errAdd) {
			  output.error("Error add:%s", errAdd);
			  process.exit(1);
			} else {
			  output.debug("Added: %s rows to datasetID: %s", rows.length, datasetID);
			  output.progress(100);
			  process.exit(0);
			}
    	  });
		}
      })
   }
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {String} google token file 
 * @param {Object} credentials The authorization client credentials.
 * @param {String} spreadsheet ID
 * @param {String} sheetname
 * @param {String} dataset ID
 * @param {Object} databot output object
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(tokenfile, credentials, spreadsheetID, sheetname, datasetID, output, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(tokenfile, function(err, token) {
    if (err) {
      output.error("%s",err);
	  process.exit(1);
    } else {
	  output.debug("Google spreadsheet authorisation successful.");
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client, spreadsheetID, sheetname, datasetID, output);
    }
  });
}

function databot(input, output, context) {
  // PROGRESS output is mandatory, to inform the host of progress.
  output.progress(0);

  config.accessToken = context.authToken;
  nqmindsTDX = new TDXApi(config);

  // Load client secrets from a local file.
  fs.readFile(config.clientSecretFile, function processClientSecrets(err, content) {
    if (err) {
      output.error('Error loading client secret file: %s',err);
      process.exit(1);
    }else {
	  // Authorize a client with the loaded credentials, then call the
      // Google Sheets API.
      authorize(config.tokenSecretFile, JSON.parse(content), input.SpreadsheetID, input.SheetName, input.DatasetID, output, listSheet);
    }
  });
}

var _ = require('lodash');
var fs = require('fs');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var TDXApi = require("nqm-api-tdx");
var config = require('./config.json');

// Load the nqm input module for receiving input from the process host.
var input = require("nqm-databot-utils").input;

var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

var nqmindsTDX;

// Read any data passed from the process host. Specify we're expecting JSON data.
input.pipe(databot);

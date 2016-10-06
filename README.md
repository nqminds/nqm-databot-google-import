# nqm-databot-google-import
This databot imports google spreadsheets into TDX.

First one has to share the spreadsheet with mereacre @ companyname.com.

Then execute the databot with the inputs:

1) DatasetID - must be already present in the TDX

2) SheetName - at the bottom of the google spreadsheet

3) SpreadsheetID - for instance for this link:

https://docs.google.com/spreadsheets/d/1M-7g5TqgdmVFHfmpz8KYksMTJs_qgirVKXAOuN3wXKc/edit#gid=0
the SpreadsheetID is "1M-7g5TqgdmVFHfmpz8KYksMTJs_qgirVKXAOuN3wXKc"
 
The TBX dataset has to have the same schema as the google spreadsheet. The schema for the google spreadsheet has to be set in row 0. Every element in google schema is of the following form: name#type, where name is the name of the field and type is an element of the set {number, string}.


The databot is public and can be accessed at nqm-databot-google-import.

**Note when executing the databot it will truncate the dataset.**

'use strict';

var SepaXML = require('sepa-xml');
const fs = require('fs')
const csv = require('csv-parser');
const { Console } = require('console');

const ROOT_FOLDER = './';

const TRANSACTION_LABEL = 'Compensation';
const TRANSACTION_DATE = new Date('2021-03-17'); ;
const TRANSACTION_INITIATOR_NAME = 'INITIATOR_NAME';
const TRANSACTION_INITIATOR_BIC = 'SOGEFRPP';
const TRANSACTION_INITIATOR_IBAN = 'INITIATOR_IBAN';


const files = [
  {fileIn: 'in/data.csv', fileOut: 'out/sepa.xml', label: "XX"}
];


function genAFile(fileIn, fileOut, label) {

  var XMLFile = new SepaXML(); // takes a single argument which is the format, default is 'pain.001.001.03'

  // This sets the header data in the file
  XMLFile.setHeaderInfo({
    messageId: TRANSACTION_LABEL + ' ' + label,
    initiator: TRANSACTION_INITIATOR_NAME
  });
  
  XMLFile.setPaymentInfo({
    id: TRANSACTION_LABEL + ' ' + label,
    method: 'TRF',
    senderName: TRANSACTION_INITIATOR_NAME,
    senderIBAN: TRANSACTION_INITIATOR_IBAN,
    batchBooking: false, // optional (default: false)
    bic: TRANSACTION_INITIATOR_BIC,
    when: TRANSACTION_DATE 
  });
  

  const users = [];

  fs.createReadStream(ROOT_FOLDER + fileIn)
    .pipe(csv({ separator: ';' }))
    .on('data', (row) => {
  
      //console.log(row);
      users.push(row);
  
  
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
  
      users.forEach(function(user) {
  
        //console.log(user);
  
        var uiban = user.IBAN;
        uiban = uiban.replace(/\s/g, '');
  
        var ubic = user.BIC;
        ubic = ubic.replace(/\s/g, '');
  
  
        const transaction = {
          id: TRANSACTION_LABEL + ' ' + label,
          amount: user.amount,
          name: user.name,
          iban: uiban,
          bic: ubic,  // optional can be auto-found it
          description: TRANSACTION_LABEL + ' ' + label
        };
  
        //console.log(transaction);
  
        // Add one of these for every transaction
        var result = XMLFile.addTransaction(transaction);
        
        //console.log("result="+result)      
        if (result==false) {
          console.log("Erreur for " + transaction.name + ' and amount=' + transaction.amount);
        }
        
  
        //idNb++;
  
  
      });
  
  
  
      XMLFile.compile(function (err, out) {
        fs.writeFileSync(ROOT_FOLDER + fileOut, out);
      });    
      console.log("Output format = '" + XMLFile.outputFormat + "'");
      console.log("Header = '" + JSON.stringify(XMLFile._header) + "'");
      console.log("Payments = '" + JSON.stringify(XMLFile._payments.info) + "'");
  
    });
  




}


Object.values(files).forEach(file => {
  console.log('======================================================================');
  console.log('fileIn=' + file.fileIn);
  console.log('fileOut=' + file.fileOut);
  genAFile(file.fileIn, file.fileOut, file.label);
  }
);







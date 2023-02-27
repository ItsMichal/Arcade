

const express = require('express');
const fs = require('fs');
const path = require('path');
const { print, getDefaultPrinter } = require('unix-print');
const pdfkit = require('pdfkit');



const app = express();
const port = 42424;


function createPDFFromParams(params) {
    const doc = new pdfkit({
        size: 'LETTER',
        margins: {
            top: 10,
            bottom: 10,
            left: 0,
            right: 0,
        },
    });
    doc.pipe(fs.createWriteStream('pdfs/test.pdf'));
    doc.fontSize(42);
    doc.font('fonts/LibreBarcode39ExtendedText-Regular.ttf');
    console.log(params.text.length);
    params.text.forEach((element, i) => {
        console.log(element);
        doc.text(element, 612/4, i*45+10, {
            width: 612/2,
            align: 'center',
        });
        doc.moveDown();
    });
    

    doc.rect( 612/4, -1, 612/2, 793).stroke();
    doc.end();
}
//max 17 params
// createPDFFromParams({ text: ['*ATK*','*DEF*','*HEL*','*RUN*','*DEF*','*HEL*','*RUN*','*ATK*','*DEF*','*HEL*','*RUN*','*DEF*','*HEL*','*RUN*','*ATK*','*DEF*','*HEL*'] });

function printTestPDF() {
    getDefaultPrinter().then((printer) => {
        print('pdfs/test.pdf', printer.printer).then(() => { console.log('printed'); });
    });
}
createPDFFromParams({text: ['*HELLO WORLD*', '*WRL*']});
printTestPDF();

app.post('print', (req, res) => {
    //Get text array from request json
    console.log(req);
    createPDFFromParams({text: ['*HELLO WORLD*']});
    res.status(204);
    res.send();

});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
} );
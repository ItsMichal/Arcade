

const express = require('express');
const fs = require('fs');
const path = require('path');
const { print, getDefaultPrinter } = require('unix-print');
const pdfkit = require('pdfkit');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
var JsBarcode = require('jsbarcode');
var { createCanvas } = require("canvas");

const app = express();
const port = 42424;
const device  = new escpos.USB();

const options = { encoding: "GB18030" /* default */ }
const printer = new escpos.Printer(device, options);


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


function printReceipt(strings) {
    
    //Get printer
    console.log("PRINTING " + strings);
    let text = strings[0];
    let player = strings[1];
    let atk = strings[2];
    let type = strings[3];

    var canvas = createCanvas();

    JsBarcode(canvas, text, {
        format: "CODE128",
        lineColor: "#000",
        width: 1,
        height: 20,
        displayValue: false,
        marginLeft: 0,
        marginTop: 0,
        marginRight: 0,
        marginBottom: 20,
    });

    //Save to png
    var out = fs.createWriteStream(__dirname + '/barcode.png');
    var stream = canvas.pngStream();

    stream.on('data', function(chunk){
        out.write(chunk);
    });

    stream.on('end', function(){
        console.log('saved png');
    

        //Print to printer
        let barcode = path.join(__dirname, 'barcode.png');

        escpos.Image.load(barcode, function(image){
            console.log(image);
            device.open(function(){
                printer
                    .flush()
                    .align('ct')
                    .text(player + ' / ' + atk + ' / ' + type)
                    .image(image, 's8')
                    .then(function(){
                        printer.feed(2);
                        printer.close();
                    });
            });
        });

    });

}

// createPDFFromParams({text: ['*P1READY*', '*P2READY*', '*P1SUMMON*', '*P2SUMMON*']});
// printTestPDF();
app.use(express.json());

app.post('/print', (req, res) => {
    //Get text array from request json
    console.log(req.body);

    printReceipt(req.body.strings);

    // createPDFFromParams({text: req.body.strings});
    // printTestPDF();
    res.status(204);
    res.send();
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
} );
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
const path = require('path');

//Get printer
console.log(escpos.USB.findPrinter())

const device  = new escpos.USB();

const options = { encoding: "GB18030" /* default */ }

const printer = new escpos.Printer(device, options);

var JsBarcode = require('jsbarcode');
var { createCanvas } = require("canvas");
var canvas = createCanvas();

JsBarcode(canvas, "P2SVMRIG", {
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
var fs = require('fs');
var out = fs.createWriteStream(__dirname + '/barcode.png');
var stream = canvas.pngStream();

stream.on('data', function(chunk){
    out.write(chunk);
});

stream.on('end', function(){
    console.log('saved png');
});

//Print to printer
const barcode = path.join(__dirname, 'barcode.png');
escpos.Image.load(barcode, function(image){
    device.open(function(){
        printer
            .flush()
            .align('ct')
            .font("A")
            .size(2, 2)
            // .raster(image, 'dwdh').cut
            // .text(`“I don’t know who you are. I don’t know what you want. If you are looking for ransom I can tell you I don’t have money, but what I do have are a very particular set of skills. Skills I have acquired over a very long career. Skills that make me a nightmare for people like you. If you let my daughter go now that’ll be the end of it. I will not look for you, I will not pursue you, but if you don’t, I will look for you, I will find you and I will kill you.”`)
            // .close()
            .text("P2 Summon Right")
            .image(image, 's8')
            .then(function(){
                printer.feed(2);

                printer.close();
            });
        // );
    });
});

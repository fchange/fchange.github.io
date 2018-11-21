"use strict";

const fs = require("fs");
const sizeOf = require('image-size');
const path = "./source/Images";
const outputfile = "./source/Images/output.json";
var dimensions;

let arr = [];
function tryToSave() {
    arr = JSON.stringify(arr, null, "\t")
    fs.writeFile(outputfile, arr, e => {
        if(e) console.log(e);
        else console.log("SAVE OVER");
    })
}
function tryToReadDir() {  
    fs.readdir(path, (err, files) => {
        if (err) return;

        files.forEach((fileName) => {
            fs.stat(path + "/" + fileName, function (err, stats) {
                if (err) return; 

                if (stats.isFile()) {
                    dimensions = sizeOf(path + "/" + fileName);
                    // console.log(dimensions.width, dimensions.height);
                    arr.push(dimensions.width 
                        + '.' + dimensions.height 
                        + ' ' + fileName);
                    count();
                }
            })
        })

        var countNum = 0;
        var count = function() {
            countNum++;
            if(countNum === files.length) {
                tryToSave();
            }
        }
    });
}

fs.exists(outputfile, function (exists) {
    if(exists) 
        fs.unlink(outputfile, e => {
            console.log("remove file done!！! exception: " + e)
            tryToReadDir();
        }) 
    else 
        tryToReadDir();
});
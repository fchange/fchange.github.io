"use strict";
    const fs = require("fs");
    const sizeOf = require('image-size');
    const path = "./source/Images";
    const outputfile = "./source/Images/output.json";
    var dimensions;

    fs.exists(outputfile, function (exists) {
      if(exists) fs.unlink(outputfile, e => {});
    });
    fs.readdir(path, function (err, files) {
        if (err) {
            return;
        }
        let arr = [];

        files.forEach((fileName) => {
            fs.stat(path + "/" + fileName, function (err, stats) {
                if (err) {
                    return;
                }
                if (stats.isFile()) {
                    dimensions = sizeOf(path + "/" + fileName);
                    // console.log(dimensions.width, dimensions.height);
                    arr.push(dimensions.width + '.' + dimensions.height + ' ' + fileName);
                    count();
                }
            })
        })

        var countNum = 0;
        var count = function() {
            countNum++;
            if(countNum == files.length) {
                fs.writeFile(outputfile, JSON.stringify(arr, null, "\t"), e => console.log("count over", e));
            }
        }
    });
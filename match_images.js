/*
1. UI team has changed new font for icons.
2. Need to replace the icons(download from invisionapp) to exist project.
3. So use this script to match icons based on filename & resolution.
 */
var path = require('path');
var fs = require('fs');
var sizeOf = require('image-size'); // npm install image-size
var rimraf = require('rimraf'); // npm install rimraf

console.log('argv length=' + process.argv.length);

if (process.argv.length < 4) {
    console.log("Usage: " + __filename + " existIconsPath newIconsPath");
    process.exit(-1);
}

var existIconsPath = process.argv[2];
var newIconsPath = process.argv[3];

var matchFilesMap = new Map();
var notMatchFilesMap = new Map();

var matchIconsOut = existIconsPath + '_new';
console.log('Match icons will copy to ' + matchIconsOut);
rimraf.sync(matchIconsOut);
fs.mkdirSync(matchIconsOut);


fs.readdir(existIconsPath, function (err, items) {
    if (err) throw err;
    var totalFileCnt = 0;
    var fileNotFound = 0;

    for (var i = 0; i < items.length; i++) {
        var fullpath = existIconsPath + "/" + items[i];
        if (fs.lstatSync(fullpath).isFile() && items[i].endsWith('.png')) {
            totalFileCnt++;

            var oldDimension = sizeOf(fullpath);
            var isFound = false;

            findFile(newIconsPath, items[i], function (filePath) {
                if (path.basename(fullpath) != path.basename(filePath)) {
                    console.log('file name not match ', fullpath, filePath);
                    return;
                }
                isFound = true;
                var newDimension = sizeOf(filePath);
                var fileName = path.basename(filePath);
                if (Math.abs(oldDimension.width - newDimension.width) <= 1 && Math.abs(oldDimension.height - newDimension.height) <= 1) {
                    matchFilesMap.set(fileName, oldDimension.width + ',' + oldDimension.height);
                    fs.copyFileSync(filePath, matchIconsOut + '/' + fileName);
                } else {
                    notMatchFilesMap.set(fileName, oldDimension.width + ',' + oldDimension.height);
                }
            });
            if (!isFound) {
                fileNotFound++;
                console.log('Not found ', fullpath);
            }
        }
    }

    for (var [key, value] of matchFilesMap) {
        notMatchFilesMap.delete(key);
    }
    console.log('Not match ', notMatchFilesMap);

    console.log('totalFileCnt ', totalFileCnt, ',dimensionMatchCnt ', matchFilesMap.size, ',dimensionNotMatchCnt ', notMatchFilesMap.size, ', fileNotFound ', fileNotFound);
});


function findFile(startPath, filter, callback) {
    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            findFile(filename, filter, callback); //recurse
        }
        else if (filter == files[i]) callback(filename);
    }
};


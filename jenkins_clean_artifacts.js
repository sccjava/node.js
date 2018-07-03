/**
 * This script is used to clean artifacts if the artifacts files are saved for long time ago.
 */
const fs = require('fs');
var util = require('util');
var logFile = fs.createWriteStream(__filename + '.log', {flags: 'a'});
// Or 'w' to truncate the file every time the process starts.
var logStdout = process.stdout;

console.log = function () {
    var now = new Date().toLocaleString('zh-cn', {hour12: false});
    logFile.write(now + ' ' + util.format.apply(null, arguments) + '\n');
    logStdout.write(now + ' ' + util.format.apply(null, arguments) + '\n');
}
console.error = console.log;

if (process.argv.length < 4) {
    console.log("Usage: node " + __filename + " jenkinsWorkspace maxArtifactsNum");
    process.exit(-1);
}

const jenkinsWorkspace = process.argv[2];
const maxArtifactsNum = process.argv[3];

console.log('%s, maxArtifactsNum = %d', jenkinsWorkspace, maxArtifactsNum);

if (maxArtifactsNum < 1) {
    console.error("maxArtifactsNum should >= 1");
    process.exit(-1);
}

var projects = fs.readdirSync(jenkinsWorkspace);
projects.forEach(function (project) {
    var artifactsPath = jenkinsWorkspace + '/' + project + '/build';
    if (fs.existsSync(artifactsPath) && fs.lstatSync(artifactsPath).isDirectory()) {
        readArtifacts(artifactsPath);
    }
});


function readArtifacts(artifactsPath) {
    var files = fs.readdirSync(artifactsPath);
    // key is file path, value is create time in MS
    var fileMap = new Map();

    // order by create time asc
    files.sort(function (a, b) {
        return fs.lstatSync(artifactsPath + '/' + a).birthtimeMs -
            fs.lstatSync(artifactsPath + '/' + b).birthtimeMs;
    });

    files.forEach(function (file) {
        var filePath = artifactsPath + '/' + file;
        var stat = fs.lstatSync(filePath);
        if (stat.isFile() && (file.endsWith('.zip') || file.endsWith('.apk'))) {
            fileMap.set(filePath, stat.birthtime.toLocaleString('zh-cn', {hour12: false}));
        }
    });
    if(fileMap.size > maxArtifactsNum) {
        cleanArtifacts(fileMap);
    }else{
        console.log('nothing to delete under ' + artifactsPath);
    }
}

function cleanArtifacts(fileMap) {
    if (fileMap && fileMap.size > maxArtifactsNum) {
        console.log('going to clean artifacts....');
        console.log(fileMap);

        var delCnt = fileMap.size - maxArtifactsNum;
        var i = 0;
        for (var [key, value] of fileMap) {
            if (i < delCnt) {
                console.log('deleted %s', key);
                fs.unlinkSync(key);
            } else {
                break;
            }
            i++;
        }
    }
}


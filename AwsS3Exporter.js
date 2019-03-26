/**
 * This script is used to export AWS S3 bucket data, then combine it together.
 */
const fs = require('fs');
const readline = require('readline');
const {spawnSync} = require("child_process");

if (process.argv.length < 4) {
    console.log("Usage: node " + __filename + " 2019-03-01  2019-03-15");
    process.exit(-1);
}

const startDate = process.argv[2];
const endDate = process.argv[3];
const outputFile = getDateFormat() + '.csv';


let days = Math.floor((Date.parse(endDate) - Date.parse(startDate)) / (24 * 60 * 60 * 1000));
if (days < 0) {
    cc.log('invalid startDate or endDate, ', startDate, endDate);
    process.exit(-1);
}

let dateList = [];
for (let i = 0; i <= days; i++) {
    let date = new Date(new Date().setDate(new Date(startDate).getDate() + i));
    let tmpDate = getDateFormat(date, 'yyyyMMdd');
    downloadData(tmpDate);
    dateList.push(tmpDate);
}

combineData();

function downloadData(date) {
    // cp command refer to https://docs.aws.amazon.com/cli/latest/reference/s3/cp.html
    let argArr = ['s3', 'cp', 's3://s3-lsaudio-dev/DeviceDataDaily/' + date, date, '--recursive'];  // AWS command
    console.log('downloading data for ', date);
    console.log('argArr is ', argArr);
    rmDir(date);
    fs.mkdirSync(date);
    spawnSync('aws', argArr, {stdio: [0, 1, 2]}, (error, stdout, stderr) => {
        if (error) {
            throw error;
        }
        console.log(stdout);
    });
}

let title = null;

function combineData() {

    for (let i = 0; i < dateList.length; i++) {
        readFile(__dirname + '/' + dateList[i] + '/');
    }
}

function readFile(path) {
    fs.readdir(path, function (err, items) {
        if (err) throw err;
        for (var i = 0; i < items.length; i++) {
            if (items[i] == ".DS_Store")
                continue;
            let fullPath = path + '/' + items[i];
            if (fs.lstatSync(fullPath).isDirectory()) {
                readFile(fullPath);
            } else if (items[i].endsWith('.csv')) {
                console.log('file is ' + fullPath);
                readCvs(fullPath);
            }
        }
    });
}

function readCvs(file) {
    let i = 0;
    const rl = readline.createInterface({
        input: fs.createReadStream(file),
        crlfDelay: Infinity
    });
    rl.on('line', (line) => {
        if (line) {
            if (title == null) {  // cvs title, copy it from the first file
                title = line;
                fs.appendFileSync(outputFile, title + '\n');
            }
            if (i != 0) {
                fs.appendFileSync(outputFile, line + '\n');
            }
            i++;
        }
    });
}

function getDateFormat(date = new Date(), fmt = 'yyyy-MM-dd hh:mm:ss') {
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function rmDir(dir, rmSelf) {
    var files;
    rmSelf = (rmSelf === undefined) ? true : rmSelf;
    dir = dir + "/";
    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        console.log("!Oops, directory not exist.");
        return;
    }
    if (files.length > 0) {
        files.forEach(function (x, i) {
            if (fs.statSync(dir + x).isDirectory()) {
                rmDir(dir + x);
            } else {
                fs.unlinkSync(dir + x);
            }
        });
    }
    if (rmSelf) {
        // check if user want to delete the directory ir just the files in this directory
        fs.rmdirSync(dir);
    }
}

// Example rmDir("file1") => delete directory with all files || rmDir("file1", false) => delete just the files in the directory




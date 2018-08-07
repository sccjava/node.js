var fs = require('fs');

if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " path/to/directory");
    process.exit(-1);
}

var path = process.argv[2];

var filenameMap = new Map();
filenameMap.set('ok_press.png', 'ok_pressed.png');
filenameMap.set('back_press.png', 'back_pressed.png');
filenameMap.set('demo_press.png', 'demo_pressed.png');
filenameMap.set('info_press.png', 'info_pressed.png');
filenameMap.set('menu_press.png', 'menu_pressed.png');
filenameMap.set('options_press.png', 'options_pressed.png');
filenameMap.set('tone_press.png', 'tone_pressed.png');
filenameMap.set('sourceAPress.png', 'source_a_pressed.png');
filenameMap.set('sourceBPress.png', 'source_b_pressed.png');
filenameMap.set('sourceCPress.png', 'source_c_pressed.png');
filenameMap.set('sourceDPress.png', 'source_d_pressed.png');
filenameMap.set('pad_bds_rc_volume_down.png', 'pad_bds_rc_volum_down.png');
filenameMap.set('pad_bds_rc_volume_down_press.png', 'pad_bds_rc_volum_down_press.png');
filenameMap.set('pad_bds_rc_volume_up.png', 'pad_bds_rc_volum_up.png');
filenameMap.set('pad_bds_rc_volume_up_press.png', 'pad_bds_rc_volum_up_press.png');

function renameFile2(path) {
    fs.readdir(path, function (err, items) {
        if (err) throw err;
        for (var i = 0; i < items.length; i++) {
            if (items[i] == ".DS_Store")
                continue;
            var oldPath = path + '/' + items[i];
            if (fs.lstatSync(oldPath).isDirectory()) {
                renameFile2(oldPath);
            } else {
                if (filenameMap.get(items[i])) {
                    var newFile = path + '/' + filenameMap.get(items[i]);
                    console.log(oldPath + " -----rename-------> " + newFile);
                    //fs.renameSync(oldPath, newFile);
                    continue;
                }

                let reg = /([A-Z]*)/g;
                let match = items[i].match(reg);
                if (match && match[0]) {
                    var tmp = items[i].replace(match[0], '_' + match[0].toLowerCase());
                    if (tmp.charAt(0) === '_'){
                        tmp = tmp.substr(1);
                    }
                    var newFile = path + '/' + tmp;
                    console.log(oldPath + " ------------> " + newFile);
                    //fs.renameSync(oldPath, newFile);
                }
            }
        }
    });
}

renameFile2(path);



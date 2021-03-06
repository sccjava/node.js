var fs = require('fs');

if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " path/to/directory");
    process.exit(-1);
}

var path = process.argv[2];

function renameFile(path){
	fs.readdir(path, function(err, items) {
		if(err)throw err;
	    for (var i=0; i<items.length; i++) {
	    	if(items[i] == ".DS_Store")
	    		continue;
	    	var oldPath = path +"/" + items[i];
	        if(fs.lstatSync(oldPath).isFile() && items[i].endsWith("-fs8.png")){
	        	var newFile = path +"/" + items[i].replace(/-fs8/g, "");
	        	console.log(oldPath + " ------------> " + newFile);
	        	fs.renameSync(oldPath, newFile);
	        }
	    }
	});
}

renameFile(path);

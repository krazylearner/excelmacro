Download files of share
----------------------------------

```
/*Downloading  and stoeing a shared file */

var outbound = require('request')

var fs = require('fs')

var getFile = function(){
	
	var options = {}
	var fileId   = 'a9c1f27f-f042-4606-901d-9785e0c2e819';
	var endPoint = "https://folders.io/file/" + fileId 
	var fileName = "test.jpg"
	
	options.uri      = endPoint,
	options.rejectUnauthorized = false,
	options.method = 'GET'
	
	outbound(options,function(err,res,body){
	
	if (!err && res.statusCode == 200)
		console.log("file saved")
	else
		console.log(err)
	
}).pipe(fs.createWriteStream(fileName))};

getFile()

```

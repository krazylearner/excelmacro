nodejs.folders.io
=================


Building and running
====================

Install [node.js](http://nodejs.org/download/) and make sure you can run npm from the command line.

In the project folder, run the node package manager, npm, to install package dependencies.

```sh
npm install
```

1. create a new Share
--------------------------

```

/*   
 * creating a new share 
 */

var outbound = require('request')
var qs = require('querystring');

var createNewShare = function(){
	
var options = {};
var endPoint       = "https://folders.io/set_files"
var postData       =  "shareId=&allowOfflineStorage=true&allowUploads=false&parent=0&data=[]"

options.uri      = endPoint,
options.form     = qs.parse(postData),
options.rejectUnauthorized = false,
options.method = 'POST'

outbound(options,function(err,res,body){
	
	if (!err && res.statusCode == 200)
		console.log(body)
	else
		console.log(err)
})
	
}

```

2. add files to this  share
--------------------------------
```
/* 
 * Adding a file to existing share 
 */

var addFileToShare = function(){
	
	var options = {}
	var endPoint = "https://folders.io/set_files"
	var shareId  = '92bdf8c5-273b-47c5-a05a-1039cbd22ade'
	var sessionCookie = 'FIOSESSIONID=C876DF6E5CEFFF526EA508C3C403AABD;'
	var fileName = "Sleep Away.mp3"
	var fileType = "audio/mp3"
	var fileSize = 4842585
	var lastModified = "2009-07-14T04:52:25.000Z"
	var fileMetadata = JSON.stringify(
	[{
		"fi":2,
		"d":false,
		"n":fileName,
		"p":null,
		"s":fileSize,
		"l":lastModified,
		"t":fileType,
		"c":[],
		"o":false
	}]
	)
	var postData = 'shareId='+ shareId+'&allowOfflineStorage=true&allowUploads=false&parent=0&data=' + fileMetadata
	
	options.uri      = endPoint,
	options.form     = qs.parse(postData),
	options.rejectUnauthorized = false,
	options.method = 'POST'
	options.headers = {'Cookie' : sessionCookie}
	
	outbound(options,function(err,res,body){
	
	if (!err && res.statusCode == 200)
		console.log(body)
	else
		console.log(err)
	
})
	
};
```

Get file listing of this share
-------------------------------

```

/* 
 * getting contents of 
 * already existing share
 */

var getShareContents = function(){
	
	var options = {}
	var shareId        = "553a1120-30ba-442b-8a4a-547a3bffb6ae"
	var endPoint       = "https://folders.io/get_share?shareId="+shareId+"&offline=0&parent=0" 
	
	options.uri      = endPoint,
	options.rejectUnauthorized = false,
	options.method = 'GET'
	
	
	outbound(options,function(err,res,body){
	
	if (!err && res.statusCode == 200)
		console.log(body)
	else
		console.log(err)
	
})
};
```

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

How to use web sockets
--------------------------------

How to upload files to a remote share
-----------------------------------










/*
 * (c) Folders.io - All rights reserved.
 * Software intended for internal use only.
 *
 * This is a proxy to assist with debugging.
 * It forwards requests for basic API services to a remote endpoint.
 * It will also act as a server, in the absence of an endpoint.
 *
 */


var http = require('http');
var fs = require('fs');
var cli = require('minimist');
// NOTES: Getting more complicated; used for /json pubsub onion service.
var url = require('url');
var qs = require('querystring');
var stream = require('event-stream');

// Watch a file for changes to the local file, otherwise keep it in memory.
var index = require('./util/watchfile');
var port;

var globalConfigure = function(request,response){
							var argv = cli(process.argv.slice(2));
							//FIXME : code will break if --port=invalidvalue example string
							port =  ('listen' in argv) ? argv['listen'] :8090;
							return  (argv);
};

// Core API proxy for folders.io

// Be generous with CORS as this is primarily a developer library.
var corsFriendly = function(response, origin) {
	response.setHeader("Access-Control-Allow-Origin", origin);
	response.setHeader("Access-Control-Allow-Credentials", "true");
	response.setHeader("Access-Control-Allow-Headers",
		["x-file-name", "x-file-type", "x-file-size", "x-file-date",
		"content-disposition", "content-type"].join(','));
	response.setHeader("Access-Control-Allow-Methods", "HEAD,GET,POST");
	response.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
};

// 'http://localhost:8000';





var resumeFriendly = function(request, response, currentSession, currentShareName) {
	var stubShare = {
		"canUploadFiles":false,
		"shareName":"GyB4Nd", "shareId":"3ba5c687-106c-4596-94db-45e9ad63278c",
		"passwordRestricted":false,"shareGateway":"0","success":true,
	};
	if(true) {
		stubShare.shareName = currentShareName; // endpoints[currentSession];
		stubShare.shareId = currentSession;
	}
	response.setHeader("Content-Type", "application/json");
	response.end(JSON.stringify(stubShare));
};



var defaultFriendly = function(request, response) {
	index("static/index.html", function(err, data) {
		response.setHeader("Content-Type", "text/html");
		response.writeHead(200);
		response.end(data);
	});
};

var eventFriendly = function(request, response) {
	if(request.headers['accepts'] === 'text/event-stream') {
		// NOTES: If we do not support text/event-stream, long-poll.
		response.setHeader("Content-Type","text/event-stream; charset=utf-8");
	}
	// response.setHeader("Transfer-Encoding", "chunked");
	response.setHeader("Cache-Control","no-cache");
	response.setHeader("Connection","keep-alive");
	response.writeHead(200);
	response.write("retry: 10000\n\n");
}

var mode0Handler = function(request,response){
	

	var uri = request.url;
	console.log("Requested URI", uri);
	var stubShare = {};
	if(uri.substr(0,5) == "/dir/") {
     // Test Stub
	   stubShare ={
		   "name":"local",
		   "fullPath":"/local",
		   "meta":{},
		   "uri":"#/http_folders.io_0:union//local",
		   "size":0,
		   "extension":"+folder",
		   "type":""
		   }
	
	}


	else if(uri.substr(0,10) == "/set_files") {
		// Test Stub
		stubShare ={
			"shareId":"testShareId",
			"success":true,
			"shareName":"testShare"
			}
	}
	
	else if(uri.substr(0,6) == '/file/'){
		// FIXME: This must be BLOB output .
	    stubShare ={
			"file":"Test File Output"
		};
	}
    else if (uri.substr(0,10) == '/get_share'){
		// test Stub
		stubShare = {
			"gateway_id":"0",
			"isProtected":false,
			"success":true,
			"onlyEmptyDirs":false,
			"fileTree":[{
				"d":false,
				"s":74098,
				"c":null,
				"fi":1,
				"p":"",
				"n":"45 (1).jpg",
				"o":false,
				"l":"2015-02-12T13:08:06.000Z",
				"dbid":"90cf2ce2-4238-43a3-a161-589c3bae7f38"}],
			"online":true,
			"uploadPermission":false,
			"allowOfflineStorage":"true"
		}
	}
	else if(request.url.substr(0,22) == "/set_upload_permission") {
			//Test Stub
			stubShare = {"success":true} ;
	}
	else if(request.url.substr(0,7) == "/session") {
		stubShare = "{}";
	}
	else if(request.url.substr(0,5) == "/json" || request.url.substr(0,12) == "/signal_poll") {
		//eventFriendly(request, response);
		stubShare = {"success":true,"signals":[{"data":{},"type":"KeepAlive"}]}
		//return;
	}
	else {
		// FIXME: Just a Placeholder 
		stubShare = {"insert":"here"};
		
	}

	
	response.setHeader('Content-Type','text/html');
	response.writeHead(200);
	response.end(JSON.stringify(stubShare),function(){
		console.log('Response Succesfully send');
	});
	
	return ;
	//send a stub response testshare
	
}

var mode1Handler = function(request,response){
	
	// Do more useful work.
	
	console.log("Placeholder :Do more useful work");
}

var RouteServer = function() {
	//this.routeHandler = routeHandler;
	var self = this;
	var argv  = globalConfigure();
	
 switch (argv['mode']){
 case 0:
 case 1:
 console.log("Server Running In Mode : " + argv['mode']);
 break;
 default:
 console.log("Server Running In Default Mode");
 argv['mode'] = 0;
 }  

var simpleServer = function(request, response) {

	//var currentSession = self.routeHandler.getCurrentSession();
	// currentToken

	// FIXME: Later.
	/*
	if(!currentSession) {
		response.end();
		return;
	}
	*/
	
     

// FIXME: Currently serving one route at the moment when proxying upstream.
	var currentToken = "testcookie" ;//currentSession.token;
	var currentShareName = "testsharename"; //currentSession.shareName;
	var currentShareId = "testshareid"; //currentSession.shareId;


	// Allow a CORS
	var origin = "http://localhost:8000";
	corsFriendly(response, origin);
	if(request.method == "OPTIONS") {
		response.end();
		return;
	}


 switch (argv['mode']){
 case 0:
 mode0Handler(request,response);
 break;
 case 1:
 mode1Handler(request,response); 
 break;
 default:
 console.log("invalid mode");
 }
	
};
	this.simpleServer = simpleServer;

};

var StandaloneProxy= function() {
	
	//this.routeHandler = routeHandler;
	this.routeServer = new RouteServer(/*routeHandler*/);
	var self = this;

	// Load our trampoline, it's part of the proxy process.
	index("static/index.html", function(err, data) {
		if(err) {
			//cb(null, err);
			return;
		}
		console.log("index file read: " + data.length + " bytes");
		
		http.createServer(self.routeServer.simpleServer).listen(port, function() {
			
			//cb();
			console.log("started local server: http://localhost:"+port);
			console.log("Standalone server engaged...");
			console.log("Serving Requests ");
		});



		});

}

//module.exports = StandaloneProxy;
new StandaloneProxy();

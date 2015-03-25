/*
 * (c) Folders.io - All rights reserved.
 * Software intended for internal use only.
 *
 * This is a proxy to assist with debugging.
 * It forwards requests for basic API services to a remote endpoint.
 * It will also act as a server, in the absence of an endpoint.
 *
 */
 
// Favored utility libraries.
var cli = require('minimist');
var http = require('http');
var outbound = require('request');
var url = require('url');
var qs = require('querystring');
// Watch a file for changes to the local file, otherwise keep it in memory.
var index = require('./util/watchfile');

/*
* Global Variables used by 
* many modules
*
*/
var baseHost;
var port;
var shareId = '';
var currentToken = '';

/*
* Command line arguments 
* handler
*
*/
var globalConfigure = function(request,response){
	//command line arguments are contained in argv object
	var argv = cli(process.argv.slice(2));
	// FIXME : code will break if --forward=inavlidvalue example number
	baseHost = ('forward' in argv) ? argv['forward'] : "https://folders.io";
	//FIXME : code will break if --port=invalidvalue example string
	port =('listen' in argv) ? argv['listen'] :8090;
	return  (argv);
}



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

var forwardFriendly  = function(request ,response,options){
var proxy = request.pipe(outbound(options)).on('response', function(result) {
//result.headers['access-control-allow-origin'] = origin;
		proxy.pipe(response);
	});

};


		
// Hanlder for --mode 0
var mode0Handler = function(request,response,argv){
// variable shareId to hold --shareid CLI argument
shareId = argv['shareid']
// variable currentoken to hold --token CLI argument (cookie)
currentToken = argv['token']
var urlObject = url.parse(request.url,true);
console.log(urlObject);
var newurl;
var options={};


// proxy '/set_files' request 
 if (request.url.substr(0,10) == '/set_files')
{

if (typeof shareId == 'undefined' || shareId.length < 1 ){
console.log('Wrong configuration during start up :');
 process.exit(1);
}

if (typeof currentToken == 'undefined' || currentToken.length < 1){
console.log('Wrong configuration during start up :') ;
process.exit(1);
}

newurl = '/set_files';
var datastring="";  // var to hold post data
var postDataObject;  // object to hold post data

// accumulating post data into string
request.on('data',function(data){
datastring+=data.toString();

});

request.on('end',function(){
postDataObject= qs.parse(datastring); // convert post data string into object 
postDataObject.shareId = shareId; // set shareId to CLI --shareid argument
// preparing options object 
options.form = postDataObject; // add post data to options object
options.uri=baseHost + newurl;  // remote url to request 
options.method = 'POST';    // request method
options.rejectUnauthorized=false;  // workaround for ssl certificate issue 
options.headers = {"Cookie":currentToken};  // add headers to --token CLI argument
console.log(options);
forwardFriendly(request,response,options); // forward it to remote host
});

}

else{
// This block handles all request except '/set_files'


if ((typeof currentToken == 'undefined' || currentToken.length < 1) == false){
options.headers = {"Cookie":currentToken}
}

// reconstructing '/get_share' request url
if (request.url.substr(0,10) == '/get_share')
{

if (typeof shareId == 'undefined' || shareId.length < 1 ){
console.log('Wrong configuration during start up :');
process.exit(1);
}

newurl =  '/get_share?shareId='+shareId; // 
newurl += '&offline='+ ((typeof urlObject['query']['offline'] == 'undefined') || (urlObject['query']['offline'] == "") ? 0:urlObject['query']['offline']);
newurl += '&parent='+ ((typeof urlObject['query']['parent'] == 'undefined') || (urlObject['query']['parent'] == "" )? 0:urlObject['query']['parent']);
newurl += (typeof urlObject['query']['gw'] == 'undefined') || (urlObject['query']['gw'] == "" )? "":'&gw=' + urlObject['query']['gw'];
newurl += (typeof urlObject['query']['_'] == 'undefined') || (urlObject['query']['_'] == "" )? "":'&_=' + urlObject['query']['_'];
console.log(newurl);
}
// reconstructing /dir/ request url
else if (request.url.substr(0,5) == '/dir/')
{
if (typeof shareId == 'undefined' || shareId.length < 1 ){
console.log('Wrong configuration during start up :');
 process.exit(1);
}
newurl = '/dir/'
newurl += shareId; // adding -shareid CLI argument to this request
}
else 
{
// all other cases which do not require shareId ex /file/ ,/press
newurl = request.url;
}
options.uri=baseHost + newurl;
options.method=request.method,
options.rejectUnauthorized=false,


//console.log(options);

forwardFriendly(request,response,options);
}
}

// Handler for --mode 1
var mode1Handler = function(request,response){

//currentToken = session['currentSession'];
var options ={};

if (currentToken == ''){
options = {
url:baseHost+request.url,
method:request.method,
"rejectUnauthorized":false,
};
// map first request to session variable and store it in global session variable
request.pipe(outbound(options)).on('response',function(result){
currentToken = result.headers['set-cookie'].toString().split(' ')[0];
//console.log(currentToken.toString().split(' '));
console.log("mapped to : 1 " + currentToken);
}).pipe(response);
}
// map all requests to global session variable
else{
//currentToken = "cookie";
var headers ={'Cookie':currentToken};
options ={
url:baseHost+request.url,
method:request.method,
"rejectUnauthorized":false,
headers:headers
};
console.log("mapped to : 2 " + currentToken);
forwardFriendly(request,response,options);
}
}

//handler --mode 2
var mode2Handler = function(request,response){
//currentToken = createCookie();
var dataString='';
var postDataObject;
var options ={};


if (request.url.substr(0,10) == '/set_files'){

// check if user wants to create new share or trying to update old share

request.on('data',function(data){
dataString = dataString+data.toString();
});

request.on('end',function(){

postDataObject= qs.parse(dataString);

     // add post data to options object
    options.uri=baseHost + request.url;  // remote url to request 
    options.method=request.method;    // request method
    options.rejectUnauthorized=false; 
// get a new session token on semtpy set_files request and set it global session variable currentToken
if (postDataObject.shareId=='' || typeof postDataObject.shareId == 'undefined'){
var responseObject='';
console.log('creating new share from scratch.This session id will now be used for all transactions until new share is not created');
postDataObject.shareId = '' 
// preparing options object 
options.form = postDataObject; // add post data to options object
//options.headers = {"Cookie":currentToken};  // add headers to --token CLI argument
typeof request.headers['Cookie'] == 'undefined' ? '' : delete request.headers['cookie'] ;
console.log(options);
request.pipe(outbound(options)).on('response',function(result){
currentToken = result.headers['set-cookie'].toString().split(' ')[0];
}).pipe(response); // forward it to remote host
}
else{
	
	options.form = postDataObject;
    options.headers = {'Cookie':currentToken};	
	forwardFriendly(request,response,options)}});
}
else{
// continue mapping requests to global session variable	
mode1Handler(request,response)
}}



/*
var mode4Handler = function(request,response){}
*/

// default mode handler == --mode 0 .This handles request when no mode is provided 
var defaultModeHandler = function(request,response){
var options = {};
options.uri=baseHost + request.url;
options.method=request.method,
options.rejectUnauthorized=false,
forwardFriendly(request,response,options);
}

var defaultFriendly = function(request, response) {
	index("static/index.html", function(err, data) {
		response.setHeader("Content-Type", "text/html");
		response.writeHead(200);
		response.end(data);
	});
};

var RouteServer = function() {
//	this.routeHandler = routeHandler;
	var self = this;
    
 var argv  = globalConfigure();


switch (argv['mode']){
 case 0:
 console.log("Proxy Server Running In Mode : 0");
 console.log("All shareids and session tokens supplied in requests will be ignored");
 break;
 case 1:
 console.log("Proxy Server Running In Mode : 1");
 console.log('All session tokens supplied  in requests will be ignored ');
 break;
 case 2:
 console.log("Proxy Server Running In Mode : 2");
 break;
 case 3: 
 // No handler for mode 3 now . Using default mode
 default:
 console.log("Proxy Server Running In Default Mode");
 }  	
	
var simpleServer = function(request,response) {
   
	// Allow a CORS
	var origin = "http://localhost:8000";
	corsFriendly(response, origin);
	if(request.method == "OPTIONS") {
		response.end();
		return;
	}
	
	

// NOTES: restHandler will handle requests internally, the subsequent methods simply proxy requests to another server.

// URL to Action:
	if(request.method == "GET" || request.method == "POST") {

// FIXME: These are still tuned to having one active shareId; the initial point of this proxy.
// Scope has increased to handling multiple active shareId
var uri = request.url;
	console.log( "forwarding " + uri+" ---> " + baseHost+uri );
	switch (argv['mode']){
 case 0:
 mode0Handler(request,response,argv);
 break;
 case 1:
 mode1Handler(request,response); 
 break;
 case 2:
 mode2Handler(request,response);
 break;
 case 3: 
 default:
 defaultModeHandler(request,response);
 }    
    
		return;
	}

	

	defaultFriendly(request, response);
};
	this.simpleServer = simpleServer;
    
};

var ForwardingProxy = function() {;
	this.routeServer = new RouteServer();
	
	var self = this;

	// Load our trampoline, it's part of the proxy process.
	index("static/index.html", function(err, data) {
		if(err) {
			//cb(null, err);
			return;
		}
	//this.port = port;
	//this.routeHandler = routeHandler
		console.log("index file read: " + data.length + " bytes");
		 globalConfigure(); 
		http.createServer(self.routeServer.simpleServer).listen(port, function() {
			console.log("started local server: http://localhost:"+port);
			console.log("Proxy listener engaged...");
			console.log("Forwarding requests to : " +baseHost);
		});
	});

}

 new ForwardingProxy();

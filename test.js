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
var http = require('http');
var fs = require('fs');
var cli = require('minimist');
var url = require('url'); // NOTES: Getting more complicated; used for /json pubsub onion service.
var qs = require('querystring');
var stream = require('event-stream');
var index = require('./util/watchfile'); // Watch a file for changes to the local file, otherwise keep it in memory.
var Fio = require('./api');
var Proxy = require('./proxy');




/*
* Global Variables 
*
*/
var port;
var mode;
var routeHandler={}
var fio = new Fio();


/*
 * Send responses to list and file requests for testing purposes.
 */
var StubFs = require('./folders/folders-stub')
var stubfs = new StubFs(fio);
onList = function(data) {
  stubfs.onList(data);
};
onBlob = function(data) {
  stubfs.onBlob(data);
};

/*
 * Serve files and folders from the current working directory.
 */
var LocalFs = require('./folders/folders-local')
var localfs = new LocalFs(fio);
onList = function(data) {
  localfs.onList(data);
};
onBlob = function(data) {
  localfs.onBlob(data);
};


/*
 * Send responses from several providers.
 */
var mounts = [
  {"stub": fio.provider("stub")},
  {"local": fio.provider("local")}
];
var UnionFs = require('./union');

var unionfs = new UnionFs(fio, mounts, {"view": "list"});
onList = function(data) {
  unionfs.onList(data);
};
onBlob = function(data) {
  unionfs.onBlob(data);
};

// Utilities from Union, handle a list request, clean up the uri.
var handleListRequest = function(fio, module, data) {
  var self = module;
  var o = data.data;
  var uri = normalizePath(self.prefix, o);
  var lsMime = ["Content-Type:application/json"];

  console.log("what is my uri", uri);
  self.ls(uri, function(files, err) {

    self.meta(uri, files, function(results) {
      fio.post(o.streamId, JSON.stringify(results), lsMime, data.shareId);
    });
  });
};

var normalizePath = function(prefix, o) {
  var path = o.path;
  if(path != null && path.indexOf('@') > -1) {
    var preuri = path.substr(path.indexOf('@')+1).substr(prefix.length);
    path = preuri;
  }
  return path;
};

/*
 * Command line arguments 
 * handler
 *
 */
var globalConfigure = function(request,response){
		var argv = cli(process.argv.slice(2));
		//FIXME : code will break if --port=invalidvalue example string
		port =  ('listen' in argv) ? argv['listen'] :8090;
		mode = argv['mode']
		switch (mode){
 			case 0:
				console.log("Server Running In Mode : " + mode);
				break;
 			case 1:
 				console.log("Server Running In Mode : " + mode);
				fioHandler();
 				break;
			default:
				console.log("Server Running In Default Mode");
 		}  
		
};

var fioHandler = function(){

	
	fio.watch().then(function(channel) {

  var uuid = function() {
	var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
	return id;
  };

  // Boot up the proxy for UI work.
   routeHandler = { 
	getCurrentSession: function() {
		return channel.session;
	},
	send: function(data) {
		// Could also check channel id vs target shareId.
		
		if(fio.streams && data.type == "DirectoryListRequest") {
			var shareId = data.data.shareId;
			if(shareId in fio.streams) {
				var target = fio.streams[shareId];
				for(var i in target) if(target[i].onList) {
					target[i].onList(data);
				}
				return;
			}
		}
		if(data.type == "RaftJoin") {
			// for(i in fio.streams) if(fio.streams[i][..].onJoin(...));
			return;
		}
		if(data.type == "SetFilesRequest") {
			channel.send(data);
			return;
		}

		channel.send(data);
	},
	once: function(id, cb) {
		console.log("93")
		if(!fio.threads){
		fio.threads = {};}
		fio.threads[id] = cb;
	},

// NOTES: Messy function for creating anonymous shares underneath the current session for proxy.js.
	// NOTES: Creates listeners for share IDs stacked under this current session.
	// NOTES: May just be easier to use postal here, in the future.
	until: function(id, listener) {
		var streamId = uuid();
		if(!fio.streams) fio.streams = {};
		if(!fio.streams[id]) fio.streams[id] = {};
		fio.streams[id][streamId] = listener;
		listener.onClose = function() {
			var obj = fio.streams[id];
			delete obj[streamId];
		        var empty = true; for (key in obj) {
				if (obj.hasOwnProperty(key)) {
					empty = false;
					break;
				}
			};
			if(empty) delete fio.streams[id];
		};
		console.log("cool", channel, id, streamId);
	}

  };
  /*
  var proxy = new Proxy(8090, routeHandler, function() {
	console.log("Proxy listener engaged");
  }); 
*/



  // The rest of things.
  console.log("Folders.io channel is active:", channel.channel);
  channel.subscribe("DirectoryListRequest", function(data, envelope) {
    console.log("ready to list it", data);
    onList(data);
  });
  channel.subscribe("FileRequest", function(data, envelope) {
    onBlob(data);
  });

  // Handle join requests.
  channel.subscribe("SetFilesRequest", function(data, envelope) {
	var shareName = Math.random().toString(36).substring(7);
	var shareId = uuid();
	var streamId = data.streamId;
	var SetFilesResponse = {
		shareId: shareId,
		shareName: shareName
	};
	fio.post(streamId, JSON.stringify(SetFilesResponse), {}, channel.session.shareId);
  });
  
});
	
};

/*
 * Core API proxy for folders.io
 * Be generous with CORS as this
 * is primarily a developer library.
 *
 */
var corsFriendly = function(response, origin) {
		response.setHeader("Access-Control-Allow-Origin", origin);
		response.setHeader("Access-Control-Allow-Credentials", "true");
		response.setHeader("Access-Control-Allow-Headers",
		["x-file-name", "x-file-type", "x-file-size", "x-file-date",
		"content-disposition", "content-type"].join(','));
		response.setHeader("Access-Control-Allow-Methods", "HEAD,GET,POST");
		response.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
};

/*
 *
 *
 */

var restHandler = function(request, requestId) {
	var uri = request.url;
	if(uri.substr(0,5) == "/dir/") {
		var shareId = uri.substr(5);
		var path = "/";
		var idxPath = shareId.indexOf("/");
		if(idxPath != -1) {
			path = shareId.substr(idxPath);
			shareId = shareId.substr(0,idxPath);
		}
		var DirectoryListRequest = {
			"type": "DirectoryListRequest",
			"data": {
				"shareId": shareId,
				"streamId": requestId,
				"serverHostname": "testHostname",
				"path": path
			}
		};
		console.log("Requested URI", uri, DirectoryListRequest);
		return DirectoryListRequest;
	}

// POST is no fun.
	if(uri.substr(0,10) == "/set_files") {
		var SetFilesRequest = {
			"type": "SetFilesRequest",
			"streamId": requestId,
			"data": { 
			}
		};
		console.log(request.body);
		return SetFilesRequest;
	}

	console.log("Requested URI", uri);
};


// 'http://localhost:8000';

/*
 *
 *
 */
var resumeFriendly = function(request, response, currentSession, currentShareName) {
		var stubShare = {
				"canUploadFiles":false,
				"shareName":"GyB4Nd", 
				"shareId":"3ba5c687-106c-4596-94db-45e9ad63278c",
				"passwordRestricted":false,
				"shareGateway":"0",
				"success":true,
		};
		if(true) {
				stubShare.shareName = currentShareName; // endpoints[currentSession];
				stubShare.shareId = currentSession;
		}
		response.setHeader("Content-Type", "application/json");
		response.end(JSON.stringify(stubShare));
};

/*
 *
 *
 */
var defaultFriendly = function(request, response) {
		index("static/index.html", function(err, data) {
		response.setHeader("Content-Type", "text/html");
		response.writeHead(200);
		response.end(data);
		});
};

/*
 *
 *
 */
var eventFriendly = function(request, response, listener, currentShareId) {
	var url_parts = url.parse(request.url, true);
	var data = url_parts.query;

	var shareId = currentShareId || data.shareId;

	if(request.headers['accepts'] === 'text/event-stream') {
		// NOTES: If we do not support text/event-stream, long-poll.
		response.setHeader("Content-Type","text/event-stream; charset=utf-8");
	}

	// response.setHeader("Transfer-Encoding", "chunked");
	response.setHeader("Cache-Control","no-cache");
	response.setHeader("Connection","keep-alive");
	response.writeHead(200);
	response.write("retry: 10000\n\n");
	

	// Forward requests to the client.
	proxyBlobRequest =
	proxyListRequest = function(data) {
		stream.readArray([data]).
		pipe(stream.stringify()).
		pipe(stream.through(function(data) {
			try {
			response.write("data: " + data + "\n");
			} catch(e) {
			console.log("oh no: " + e);
			response.end();
			};
		}));
	};
	response.on('end', function() {
		proxyBlobRequest = proxyListRequest = null;
		if(listener && listener.onClose) listener.onClose();
	});
	if(listener) {
		listener.onList = proxyBlobRequest;
		listener.onBlob = proxyBlobRequest;
	}
	return shareId;
};


/*
 *
 *
 */
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
					"n":"image1.jpg",
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
		}
		else {
				// FIXME: Just a Placeholder 
				stubShare = {"insert":"here"};
		}

		response.setHeader('Content-Type','text/html');
		response.writeHead(200);
		//send a stub response testshare
		response.end(JSON.stringify(stubShare),function(){
				console.log('Response Succesfully send');
		});
	
		return ;
	
};

/*
 *
 *
 */
 
var mode1Handler = function(request,response){
		
		var self = this;
		this.routeHandler = routeHandler
		var currentSession = self.routeHandler.getCurrentSession();
	// currentToken

	// FIXME: Later.
	if(!currentSession) {
		response.end();
		return;
	}

// FIXME: Currently serving one route at the moment when proxying upstream.
	var currentToken = currentSession.token;
	var currentShareName = currentSession.shareName;
	var currentShareId = currentSession.shareId;
	// NOTES: restHandler will handle requests internally, the subsequent methods simply proxy requests to another server.
	if(request.method == "GET" || request.method == "POST") {
                var requestId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
		var result = restHandler(request, requestId);
		if(result) {
			console.log("sending a data packet through.");
			var streamId = result.data.streamId || result.streamId;
           
			self.routeHandler.once(streamId, function(stream, headers) {
				console.log("response", streamId, headers);
				// NOTES: Bug in the client, it tries to deserialize twice.
				if(headers) delete headers['Content-Type'];
				response.writeHead(200, headers);
                		return stream.pipe(response);
			});
			// Request could be self-served from a provider or from a listening json stream.
			self.routeHandler.send(result);
			return result;
		}

		
	//defaultFriendly(request, response);
		
		
}

if(request.method == "GET") {

// FIXME: These are still tuned to having one active shareId; the initial point of this proxy.
// Scope has increased to handling multiple active shareIds.


		// Event stream.
		if(request.url.substr(0,5) == "/json") {
			var listen = {};
			// Listen for events from one ID:
			if(false) {
				eventFriendly(request, response, listen, currentShareId);
				// uses a global, passes to a submodule, broken.
				proxyListRequest = listen.onList;
				proxyBlobRequest = listen.onBlob;
				listen.onClose = function() { proxyListRequest = proxyBlobRequest = null; };
			}
             
			var shareId = eventFriendly(request, response, listen);
			self.routeHandler.until(shareId, listen);
		}

		// Handshake. set_files is a similar handshake.
		else if(request.url.indexOf("/get_share") === 0) {
			resumeFriendly(request, response, currentShareId, currentShareName);
		}

		// UTF-8 and Blob.
		else if(request.url.substr(0,5) == "/file" || request.url.indexOf("/dir") === 0 ||
			request.url.indexOf("/terms") === 0 || request.url.indexOf("/press") === 0) {
			getFriendly(request, response, currentToken);
		}

		else {
			defaultFriendly(request, response);
		}
		return;
	}

}


/*
 *
 *
 */
var RouteServer = function() {
		
		
		var simpleServer = function(request, response) {

		// Allow a CORS
		var origin = "http://localhost:8000";
		corsFriendly(response, origin);
		if(request.method == "OPTIONS") {
			response.end();
			return;
		}
		
		switch ( mode){
            		
		
		case 1:
		      mode1Handler(request,response);
			  break;
		case 0:
		default:
			mode0Handler(request,response);	
		
		}
	};
	this.simpleServer = simpleServer;

};

var StandaloneProxy= function() {
	
	//this.routeHandler = routeHandler;
	this.routeServer = new RouteServer(/*routeHandler*/);
	var self = this;
    globalConfigure();
	
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


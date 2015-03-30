nodejs.folders.io
=================


Building and running
====================

Install [node.js](http://nodejs.org/download/) and make sure you can run npm from the command line.

In the project folder, run the node package manager, npm, to install package dependencies.

```sh
npm install
```

Proxy services
===================

There is an advanced proxy server which can be used to forward client requests to remote hosts .The functionality of this proxy server can be modified or configured with the use of various command line switches.

##Basic Usage

To access simple proxy services ,start the proxy server with no command line switches .All modules are written inside single nodejs file forwardingProxy.js.
By default the proxy server will run in default mode on port 8090 and all requests will be forwarded to https://folders.io . Clients can query simple or complex requests and all necessary information including headers must be provided by the clients accessing the proxy .In this mode , the proxy server does nothing other then simply forwarding client requests to remote host . 

####Start a simple proxy server  


```
$ node forwardingProxy.js 
```

####Console Output 

```
Proxy Server Running In Default Mode
index file read: 1254 bytes
started local server: http://localhost:8090
Proxy listener engaged...
Forwarding requests to : https://folders.io
```

###Client Usage

####Requesting a simple page https://folders.io/press

```
$ curl localhost:8090/press
```

####Ouput on client terminal

Complete HTML snippet

#### Adding file to existing share

```
$ curl "http://localhost:8090/set_files"  -H "Cookie: FIOSESSIONID=
156AE139308A9629028D7E31EE1C0E43;"  --data "shareId=a4ccfea6-c4db-4530-8589-ef4f
a746d25f&allowOfflineStorage=true&allowUploads=false&parent=0&data="%"5B"%"7B"%"
22fi"%"22"%"3A1"%"2C"%"22d"%"22"%"3Afalse"%"2C"%"22n"%"22"%"3A"%"22Akansha.jpg"%
"22"%"2C"%"22p"%"22"%"3Anull"%"2C"%"22s"%"22"%"3A27114"%"2C"%"22l"%"22"%"3A"%"22
2015-03-10T12"%"3A37"%"3A24.000Z"%"22"%"2C"%"22t"%"22"%"3A"%"22image"%"2Fjpeg"%"
22"%"2C"%"22c"%"22"%"3A"%"5B"%"5D"%"2C"%"22o"%"22"%"3Afalse"%"7D"%"5D"
```

####Ouput on client terminal

```
{"shareId":"a4ccfea6-c4db-4530-8589-ef4fa746d25f","success":true,"shareName":"ZtYhK9"}
```

##Advance Usage

Proxy server supports different switches which can be added to command line  while invoking proxy.These switches can be used to modify port ,remote host and modes.  


#### Configure PORT  

To start proxy server on different port just include the switch **--listen=port** while invoking the proxy .For example to 

start proxy server on port 9999 do this 

```
$ node forwardingProxy.js --listen=9999
```

####Console Output 

```
Proxy Server Running In Default Mode
index file read: 1254 bytes
started local server: http://localhost:9999
Proxy listener engaged...
Forwarding requests to : https://folders.io
```

#### Configure HOST 

To forward requests to hosts other then *https://folders.io* , use  switch **--forward=hostname**
````
$ node forwardingProxy.js --forward=https://www.google.com
````
####Console Output 

```````
Proxy Server Running In Default Mode
index file read: 1254 bytes
started local server: http://localhost:8090
Proxy listener engaged...
Forwarding requests to : https://www.google.com
``````

#### MODES

Functionality of proxy server can be modified by including **--mode=0|1|2|3** switch.When --mode switch is missing while invoking proxy from command line  proxy server runs on default  mode .This can be changed by usng --mode switch .Currently there are 4 extra modes supported in proxy server besides default mode.

#####MODE 0
In this mode all requests are mapped to a single share ID and cookie (token), as set by the command line/hard code variable.

######Usage

```
$ node forwardingProxy.js --mode 0 --shareid=testshareid --token=sessioncookie
```

######Example

######Server 

```
$ node forwardingProxy.js --mode 0 --shareid="f3fe855d-7051-40e8-a88d-2bcfb23c5e96"--token="FIOSESSIONID=156AE139308A9629028D7E31EE1C0E43"
```

######Client Request

```
$ curl "http://localhost:8090/set_files" --data "alloOfflineStorage=true&allowUploads=false&parent=0&data="%"5B"%"7B"%"22fi"%"22"%"3A1"%"2C"%"22d"%"22"%"3Afalse"%"2C"%"22n"%"22"%"3A"%"22Akansha.jpg"%"22"%"2C"%"22p"%"22"%"3Anull"%"2C"%"22s"%"22"%"3A27114"%"2C"%"22l"%"22"%"3A"%"222015-03-10T12"%"3A37"%"3A24.000Z"%"22"%"2C"%"22t"%"22"%"3A"%"22image"%"2Fjpeg"%"22"%"2C"%"22c"%"22"%"3A"%"5B"%"5D"%"2C"%"22o"%"22"%"3Afalse"%"7D"%"5D" -k
```

######Another Client Request

```
$ curl "http://localhost:8090/get_share" 
```

Users can omit shareId from requests  and session headers and all their requests will be mapped to shareid and sessions as supplied in command line
For requests which do not require sessions or shareids to complete successfully ,they will be simply forwarded upstream.


#####MODE 1

In this mode  all share IDs created are mapped  to a single cookie (session token).This cookie is automatically obtained by proxy on start up on first request which retains it until next startup

######Usage

```
$ node forwardingProxy.js --mode 1 
````

######Client Requests
````
curl "http://localhost:8090/set_files"  --data "shareId=&allowOff
lineStorage=true&allowUploads=false&parent=0&data="%"5B"%"5D" 
````
######Response
````
{"shareId":"2fb40e68-caeb-4130-804d-ea156a0be7f7","success":true,"shareName":"6SAUrn"}
````

###### Another Client Requests

```
curl "http://localhost:8090/set_files" --data "shareId=330b1431-a
177-484f-ad1b-85931e9b8dfe&allowOfflineStorage=true&allowUploads=false&parent=0&
data="%"5B"%"7B"%"22fi"%"22"%"3A3"%"2C"%"22d"%"22"%"3Afalse"%"2C"%"22n"%"22"%"3A
"%"22Adarsh.jpg"%"22"%"2C"%"22p"%"22"%"3Anull"%"2C"%"22s"%"22"%"3A38823"%"2C"%"2
2l"%"22"%"3A"%"222015-03-10T12"%"3A08"%"3A32.000Z"%"22"%"2C"%"22t"%"22"%"3A"%"22
image"%"2Fjpeg"%"22"%"2C"%"22c"%"22"%"3A"%"5B"%"5D"%"2C"%"22o"%"22"%"3Afalse"%"7
D"%"5D"
```

######Response

```
{"shareId":"2fb40e68-caeb-4130-804d-ea156a0be7f7","success":true,"shareName":"6SAUrn"}
```
 As you can see same response is generated without passing any session headers because proxy is automatically adding the session before forwarding request 

##### MODE 2

In this mode all share IDs created are mapped to a token each time one is created and used.

######Usage

````
$ node forwardingProxy.js --mode 2 
`````

Server services

There is a standalone server which can be run in two modes.By default it runs in mode 0.


Usage
------------
$ node standaloneProxy.js

Switches
--------------------

Server supports two switches which can be added to command line  while invoking server 


#### Configure PORT  

--listen = PORT 

Start standalone server on different port

To start  server on different port just include the switch --listen=port while invoking the server .For example to 

start  server on port 9999 do this 

````
$ node standaloneProxy.js --listen=9999
````

#### Configure MODE

--mode 0|1


 
MODE 0
====================
In this mode server responds with test stubs .

Usage
------------
$ node standaloneProxy.js --mode 0 

MODE 1
====================
Not implemented yet 

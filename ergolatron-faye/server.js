var http = require('http');
var faye = require('faye');

var bayeux = new faye.NodeAdapter({
    mount: '/faye',
    timeout: 45
});

// Handle non-Bayeux requests
var server = http.createServer(function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello, non-Bayeux request');
});

bayeux.attach(server);
var port = process.env.PORT || 8080;
server.listen(port);

console.log('Started faye-server at port: ' + port);

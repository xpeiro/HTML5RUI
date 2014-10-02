/*VIDEO STREAMING CODE by Dominic Szablewski - phoboslab.org, github.com/phoboslab:
  http://phoboslab.org/log/2013/09/html5-live-video-streaming-via-websockets/

  Adapted to express, small modifications.
*/

var STREAM_MAGIC_BYTES = 'jsmp';
var PASSWORD = "hrui1311"
var process = require("child_process");

module.exports = function(socketServer, FFMPEGPORT, VIDEOWIDTH, VIDEOHEIGHT) {
socketServer.on('connection', function(socket) {
    var streamHeader = new Buffer(8);
    streamHeader.write(STREAM_MAGIC_BYTES);
    streamHeader.writeUInt16BE(VIDEOWIDTH, 4);
    streamHeader.writeUInt16BE(VIDEOHEIGHT, 6);
    socket.send(streamHeader, {
        binary: true
    });
    console.log('New LiveVideo WebSocket Connection (' + socketServer.clients.length + ' total)');
    socket.on('close', function(code, message) {
        console.log('Disconnected LiveVideo WebSocket (' + socketServer.clients.length + ' total)');
        if (socketServer.clients.length == 0) {
            process.exec("killall avconv", function(error, stdout, stderr) {
                if ( !! error) {
                    console.log("killall AVCONV Processes Failed");
                }
            });
        }
    });
});
socketServer.broadcast = function(data, opts) {
    for (var i in this.clients) {
        if (this.clients[i].readyState == 1) {
            this.clients[i].send(data, opts);
        } else {
            console.log('Error: Client (' + i + ') not connected.');
        }
    }
};
var streamServer = require('http').createServer(function(request, response) {
    var params = request.url.substr(1).split('/');
    width = (params[1] || 320) | 0;
    height = (params[2] || 240) | 0;
    if (params[0] == PASSWORD) {
        console.log('Stream Connected: ' + request.socket.remoteAddress + ':' + request.socket.remotePort + ' size: ' + width + 'x' + height);
        request.on('data', function(data) {
            socketServer.broadcast(data, {
                binary: true
            });
        });
    } else {
        console.log('Failed Stream Connection: ' + request.socket.remoteAddress + request.socket.remotePort + ' - wrong secret.');
        response.end();
    }
}).listen(FFMPEGPORT);

}
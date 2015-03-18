/*VIDEO STREAMING CODE by Dominic Szablewski - phoboslab.org, github.com/phoboslab:
  http://phoboslab.org/log/2013/09/html5-live-video-streaming-via-websockets/

  Adapted to express, small modifications.
*/
const app = require('../../app');
const VIDEOPORT = app.VIDEOPORT;
const VIDEOWIDTH = app.VIDEOWIDTH;
const VIDEOHEIGHT = app.VIDEOHEIGHT;
const STREAM_MAGIC_BYTES = 'jsmp';
const PASSWORD = "hrui1311"
const process = require("child_process");

module.exports = function(socketServer, streamType, PORT) {
    socketServer.on('connection', function(socket) {
        if (streamType == 'videoStream') {
            var streamHeader = new Buffer(8);
            streamHeader.write(STREAM_MAGIC_BYTES);
            streamHeader.writeUInt16BE(VIDEOWIDTH, 4);
            streamHeader.writeUInt16BE(VIDEOHEIGHT, 6);
            socket.send(streamHeader, {
                binary: true
            });
        };
        console.log('New ' + streamType + ' WebSocket Connection (' + socketServer.clients.length + ' total)');
        socket.on('close', function(code, message) {
            console.log('Disconnected ' + streamType + ' WebSocket (' + socketServer.clients.length + ' total)');
            if (socketServer.clients.length == 0) {
                process.exec("killall avconv", function(error, stdout, stderr) {
                    if (!!error) {
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
        console.log('Stream Connected: ' + request.socket.remoteAddress + ':' + request.socket.remotePort);
        request.on('data', function(data) {
            socketServer.broadcast(data, {
                binary: true
            });
        });
    }).listen(PORT);

}

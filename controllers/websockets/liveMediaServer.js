/*
    HTML5 Robot User Interface Server
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

/*  Adapted from original code by Dominic Szablewski - phoboslab.org:
    github.com/phoboslab
    http://phoboslab.org/log/2013/09/html5-live-video-streaming-via-websockets/  
*/

/*
    Live Media Server:
    Captures audio or video stream on a local port, broadcasts it to connected
    websockets.
*/
const app = require('../../app');
const fs = require('fs');
const scriptCtrl = require('../scriptController');
//Construct MP3 header file with data necessary for AuroraJS decoder to function
const AUDIOARGS = app.AUDIOARGS;
var audioHeader;
var audioHeaderPath;
//use different header depending on number of channels in audio device
if (AUDIOARGS.indexOf('-ac') + 1 == AUDIOARGS.indexOf('1'))
    audioHeaderPath = 'controllers/websockets/audioheaders/audioheaderAC1';
else
    audioHeaderPath = 'controllers/websockets/audioheaders/audioheaderAC2';
audioHeader = fs.readFile(audioHeaderPath, function(err, data) {
    audioHeaderRead(err, data);
});
var audioHeaderRead = function(err, data) {
    if (err) throw err;
    audioHeader = data.slice(0, 8 * 960);
};
//Construct MPEG1 header file with data necessary for JSMPEG to function
const VIDEOPORT = app.VIDEOPORT;
const VIDEOWIDTH = app.VIDEOWIDTH;
const VIDEOHEIGHT = app.VIDEOHEIGHT;
const STREAM_MAGIC_BYTES = 'jsmp';
var videoHeader = new Buffer(8);
videoHeader.write(STREAM_MAGIC_BYTES);
videoHeader.writeUInt16BE(VIDEOWIDTH, 4);
videoHeader.writeUInt16BE(VIDEOHEIGHT, 6);

module.exports = function(socketServer, streamType, PORT) {
    socketServer.on('connection', function(socket) {
        var streamHeader;
        if (streamType == 'audioStream') {
            scriptCtrl.killStream(streamType);
            streamHeader = audioHeader;

        } else {
            streamHeader = videoHeader;
        }
        //send header to websocket
        socket.send(streamHeader, {
            binary: true
        });
        //start media stream (from now on sends media stream, see streamServer method)
        scriptCtrl.runStream(streamType);
        console.log('New ' + streamType + ' WebSocket Connection (' + socketServer.clients.length + ' total)');
        //when websocket closed, stop media stream
        socket.on('close', function(code, message) {
            console.log('Disconnected ' + streamType + ' WebSocket (' + socketServer.clients.length + ' total)');
            if (socketServer.clients.length == 0) {
                scriptCtrl.killStream(streamType);
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
    //when a media stream connects, broadcast data to websocket
    var streamServer = require('http').createServer(function(request, response) {
        console.log('Stream Connected: ' + request.socket.remoteAddress + ':' + request.socket.remotePort);
        request.on('data', function(data) {
            socketServer.broadcast(data, {
                binary: true
            });
        });
    }).listen(PORT);

}

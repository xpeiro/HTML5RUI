/*
    HTML5 Robot User Interface Server
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

/*  Some code adapted from original work by Dominic Szablewski - phoboslab.org:
    github.com/phoboslab
    http://phoboslab.org/log/2013/09/html5-live-video-streaming-via-websockets/  
*/

/*
    Live Media Server:
    Captures audio or video stream on a local port, broadcasts it to connected
    websockets.
*/
const app = require('../../app');
const scriptCtrl = require('../scriptController');
//Construct MP3 header file with data necessary for AuroraJS decoder to function
const audioHeader = constructAudioHeader(app.PARAMS.AUDIOARGS[app.PARAMS.AUDIOARGS.indexOf('-ac') + 1]);
//Construct MPEG1 header file with data necessary for JSMPEG to function
const videoHeader = constructVideoHeader(app.PARAMS.VIDEOWIDTH, app.PARAMS.VIDEOHEIGHT);

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
        console.log('HRUI ' + streamType + ': Client connected (' + socketServer.clients.length + ' concurrent)');
        //when websocket closed, stop media stream
        socket.on('close', function(code, message) {
            console.log('HRUI Media: ' + streamType + ' Client disconnected (' + socketServer.clients.length + ' concurrent)');
            if (socketServer.clients.length == 0) {
                scriptCtrl.killStream(streamType);
                scriptCtrl.changeMediaDevice({
                    streamType: streamType,
                    deviceNum: 'init',
                });
            };
        });
    });
    socketServer.broadcast = function(data, opts) {
        for (var i in this.clients) {
            if (this.clients[i].readyState == 1) {
                this.clients[i].send(data, opts);
            } else {
                console.log('HRUI Media Error: ' + streamType + ' Client (' + i + ') not connected.');
            }
        }
    };
    //when a media stream connects, broadcast data to websocket
    var streamServer = require('http').createServer(function(request, response) {
        console.log('HRUI Media: Stream Connected on ' + request.socket.remoteAddress + ':' + request.socket.remotePort);
        request.on('data', function(data) {
            socketServer.broadcast(data, {
                binary: true
            });
        });
    }).listen(PORT);

};

function constructAudioHeader(noOfChannels) {
    const zeroes = new Buffer(['0x00']);
    var mp3frame;
    var audioHeader = new Buffer([]);
    //different frame header for single channel source device
    if (noOfChannels == '1') {
        mp3frame = new Buffer(['0xff', '0xfb', '0x14', '0xc4']);
    } else { //assumes 2 channels
        mp3frame = new Buffer(['0xff', '0xfb', '0x14', '0x64']);
    };
    //pad out mp3 frame with zeroes
    for (var i = 4; i < 96; i++) {
        mp3frame = Buffer.concat([mp3frame, zeroes]);
    };
    //construct a header with 40 frames
    for (var i = 0; i < 40; i++) {
        audioHeader = Buffer.concat([audioHeader, mp3frame]);
    };
    return audioHeader;
};

function constructVideoHeader(VIDEOWIDTH, VIDEOHEIGHT) {
    const STREAM_MAGIC_BYTES = 'jsmp';
    var videoHeader = new Buffer(8);
    videoHeader.write(STREAM_MAGIC_BYTES);
    videoHeader.writeUInt16BE(VIDEOWIDTH, 4);
    videoHeader.writeUInt16BE(VIDEOHEIGHT, 6);
    return videoHeader;
};

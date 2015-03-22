/*
    HTML5 Robot User Interface Server
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/
/*
    App Modules Setup
*/
const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ws = require('ws');
const compression = require('compression');
const favicon = require('serve-favicon');
const logger = require('morgan');
const path = require('path');
const monk = require('monk');
/*  
    Server Parameters Setup.
    Can be configured to suit application needs, see comments.
*/
const PORT = 80; //Set Web Server Port. Refer to README 'Notes on using port 80'.
const NODE = 'node'; //Set command for node script calls
const PYTHON = 'python'; //Set command for python script calls
const AVCONV = 'avconv'; //Set command for avconv/ffmpeg
const DEV = "/dev/"; //dev directory
const VIDEOPORT = 8000; //Port where video stream is received
const VIDEOWSPORT = 3000; //Port where video stream is emitted (sent to front-end)
const VIDEOWIDTH = 640; //Must be a multiple of 2.
const VIDEOHEIGHT = 480;
const VIDEODEVICE = "video0"; // initial video device (Need access permission ~ User must be in video Group.)
const VIDEOARGS = ['-s',
    VIDEOWIDTH + 'x' + VIDEOHEIGHT,
    '-f', 'video4linux2',
    '-i', DEV + VIDEODEVICE,
    '-f', 'mpeg1video', //video format. Do not change (required by JSMPEG).
    '-b', '32k', //video bitrate, modify at will.
    '-r', '30', //video fps, modify at will.
    'http://localhost:' + VIDEOPORT
]; // args passed to AVCONV/FFMPEG to stream video
const AUDIOPORT = 1234; //Port where audio stream is received
const AUDIOWSPORT = 4000; //Port where audio stream is emitted (sent to front-end)
const AUDIODEVICE = 'hw:0,0'; // audio device
const AUDIOARGS = ['-f', 'alsa',
    '-ac', '2', //Change to '1' if audio hardware has one channel.
    '-i', AUDIODEVICE,
    '-acodec', 'libmp3lame', //mp3 encoding. Do not change without changing Aurora Decoder (e.g. to FLAC.js)
    '-ab', '32k', //should not be changed without regenerating headers, though results may vary.
    '-f', 'mp3',
    'http://127.0.0.1:' + AUDIOPORT
]; // args passed to AVCONV/FFMPEG to stream audio (EXPERIMENTAL FEATURE)
//MongoDB Parameters Setup
const DB = monk('localhost:27017/hrui');
const HRUIDATADB = DB.get('data');
// Export Parameters (for use in all modules)
module.exports = {
    app: app,
    PORT: PORT,
    NODE: NODE,
    PYTHON: PYTHON,
    AVCONV: AVCONV,
    DEV: DEV,
    VIDEOPORT: VIDEOPORT,
    VIDEOWSPORT: VIDEOWSPORT,
    VIDEOWIDTH: VIDEOWIDTH,
    VIDEOHEIGHT: VIDEOHEIGHT,
    VIDEODEVICE: VIDEODEVICE,
    VIDEOARGS: VIDEOARGS,
    AUDIODEVICE: AUDIODEVICE,
    AUDIOPORT: AUDIOPORT,
    AUDIOWSPORT: AUDIOWSPORT,
    AUDIOARGS: AUDIOARGS,
    HRUIDATADB: HRUIDATADB,
};
/*
    Controllers Setup
*/
// Require controller modules
const ioCtrl = require('./controllers/websockets/io');
const updaters = require('./controllers/updaters');
const scriptCtrl = require('./controllers/scriptController');
const liveVideo = require('./controllers/websockets/liveMediaServer');
const liveAudio = require('./controllers/websockets/liveMediaServer');
// Socket.io event handlers Setup
ioCtrl(io);
// Live Video Server Setup
liveVideo(new(ws.Server)({
    port: VIDEOWSPORT
}), 'videoStream', VIDEOPORT);
// Live Audio Server Setup
liveAudio(new(ws.Server)({
    port: AUDIOWSPORT
}), 'audioStream', AUDIOPORT);
/*
    Web Server Setup
*/
// compression setup (compress all requests)
app.use(compression());
// set favicon
app.use(favicon(__dirname + '/public/images/favicon.ico'));
// setup HTTP Request Logger (morgan) with 'dev' style
app.use(logger('dev'));
// set static route directory
app.use(express.static(path.join(__dirname, 'public')));
// view engine setup (jade)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});
// start server
http.listen(PORT, function() {
    console.log('listening on *:' + PORT);
});

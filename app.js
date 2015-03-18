//Require NodeJS Modules
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
//Set Parameters (change to appropriate values if necessary):
const PORT = 80; //Set Web Server Port
const AVCONV = 'avconv'; //Set command for avconv/ffmpeg
//Set Video Streaming Parameters
const VIDEOPORT = 8000; //Port where stream is received
const VIDEOWSPORT = 3000; //Port where stream is emitted
const VIDEOWIDTH = 320;
const VIDEOHEIGHT = 240;
const VIDEODEVICE = "/dev/video0"; //source device
// args passed to AVCONV/FFMPEG to stream video
const VIDEOARGS = ['-s',
    VIDEOWIDTH + 'x' + VIDEOHEIGHT,
    '-f', 'video4linux2',
    '-i', VIDEODEVICE,
    '-f', 'mpeg1video',
    '-b', '200k',
    '-r', '30',
    'http://localhost:' + VIDEOPORT
];
//for screen capture use args: "-f x11grab -s SCREENRESOLUTION -r 30 -i :0.0 -f mpeg1video -s 320x240 OUTPUT"
//Set Audio Streaming Parameters (see Video Param comments)
const AUDIOPORT = 1234;
const AUDIOWSPORT = 4000;
const AUDIODEVICE = 'hw:0,0';
const AUDIOARGS = ['-f', 'alsa',
    '-i', AUDIODEVICE,
    '-acodec', 'flac',
    '-re',
    '-f', 'flac',
    'http://127.0.0.1:' + AUDIOPORT
];
//Set MongoDB Parameters
const DB = monk('localhost:27017/hrui');
const HRUIDATADB = DB.get('data');
// Export Parameters (for use in all modules)
module.exports = {
    app: app,
    PORT: PORT,
    AVCONV: AVCONV,
    VIDEOPORT: VIDEOPORT,
    VIDEOWSPORT: VIDEOWSPORT,
    VIDEOWIDTH: VIDEOWIDTH,
    VIDEOHEIGHT: VIDEOHEIGHT,
    VIDEOARGS: VIDEOARGS,
    AUDIOPORT: AUDIOPORT,
    AUDIOWSPORT: AUDIOWSPORT,
    AUDIOARGS: AUDIOARGS,
    HRUIDATADB: HRUIDATADB,
};
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
// Web Server Setup
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

/*
    HTML5 Robot User Interface Server
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

/*  App Modules Setup   */
const
    express = require('express'),
    app = express(),
    fs = require('fs'),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    ws = require('ws'),
    compression = require('compression'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    path = require('path'),
    monk = require('monk'),
    /* MongoDB Parameters Setup. Change only if required. */
    DB = monk('localhost:27017/hrui'),
    HRUIDATADB = DB.get('data');
/*  
    Server Parameters Setup.
    Can be configured through config.json file (or directly here in app.js)
    Default parameters are used where no parameter is given.
    See comments and user manual for usage tips and restrictions.
*/
const DEFAULTPARAMS = {
    PORT: 80, //Set Web Server Port. Refer to README 'Notes on using port 80'.
    NODE: 'node', //Set command for node script calls
    PYTHON: 'python', //Set command for python script calls
    AVCONV: 'avconv', //Set command for avconv/ffmpeg
    DEV: "/dev/", //dev directory
    VIDEOPORT: 8000, //Port where video stream is received
    VIDEOWSPORT: 3000, //Port where video stream is emitted (sent to front-end)
    VIDEOWIDTH: 320, //Must be a multiple of 2.
    VIDEOHEIGHT: 240,
    VIDEODEVICE: "video0", // initial video device (Need access permission ~ User must be in video Group.)
    VIDEOARGS: ['-s',
        '320x240', //change according to VIDEOWIDTH/HEIGHT
        '-f', 'video4linux2',
        '-i', '/dev/video0', //change according to DEV and VIDEODEVICE
        '-f', 'mpeg1video', //video format. Do not change (required by JSMPEG).
        '-b', '32k', //video bitrate, modify at will.
        '-r', '30', //video fps, modify at will.
        'http://localhost:8000' //change port according to VIDEOPORT.
    ], // args passed to AVCONV/FFMPEG to stream video
    AUDIOPORT: 1234, //Port where audio stream is received
    AUDIOWSPORT: 4000, //Port where audio stream is emitted (sent to front-end)
    AUDIODEVICE: 'hw:0,0', // audio device (Need access permission ~ User must be in audio Group.)
    AUDIOCHANNELS: 2,
    AUDIOARGS: ['-f', 'alsa',
        '-ac', '2', //Change to '1' if audio hardware has one channel.
        '-i', 'hw:0,0', //change according to AUDIODEVICE
        '-acodec', 'libmp3lame', //mp3 encoding. Do not change without changing Aurora Decoder (e.g. to FLAC.js)
        '-ab', '32k', //should not be changed without regenerating headers, though results may vary.
        '-f', 'mp3',
        'http://localhost:1234' //change port according to AUDIOPORT
    ], // args passed to AVCONV/FFMPEG to stream audio (EXPERIMENTAL FEATURE)
    HRUIDATADB: HRUIDATADB,

};
//Attempt to parse parameters from config.json
var PARAMS = DEFAULTPARAMS;
try {
    fs.statSync('config.json');
    console.log('HRUI: Parsing parameters from config.json ...');
    //parse from config.json
    var parsedparams = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    for (var param in parsedparams) {
        //check parameter exists, disregard all params with prepended '_'
        if (!!parsedparams[param] && param[0] != '_') {
            //assign param
            PARAMS[param] = parsedparams[param];
            console.log('HRUI: Set ' + param + ' = ' + PARAMS[param]);
        };
    }
    console.log('HRUI: Using default values for other parameters');
    //rewrite live media arguments with params
    PARAMS.VIDEOARGS[1] = PARAMS.VIDEOWIDTH + 'x' + PARAMS.VIDEOHEIGHT;
    PARAMS.VIDEOARGS[5] = PARAMS.DEV + PARAMS.VIDEODEVICE;
    PARAMS.VIDEOARGS[12] = 'http://localhost:' + PARAMS.VIDEOPORT;
    PARAMS.AUDIOARGS[3] = PARAMS.AUDIOCHANNELS;
    PARAMS.AUDIOARGS[5] = PARAMS.AUDIODEVICE;
    PARAMS.AUDIOARGS[12] = 'http://localhost:' + PARAMS.AUDIOPORT;
} catch (err) {
    if (!!err) {
        if (err.code == 'ENOENT') {
            console.log('HRUI: config.json not found.\nHRUI: Using default parameters (defined in app.js)');
        } else if (err.name == 'SyntaxError') {
            console.log('HRUI: Syntax Error in config.json\nHRUI: ' + err.message +
                '\nHRUI: Using default parameters (defined in app.js)');
        } else {
            throw err;
        }
    };
};

// Export Parameters (for use in all modules)
module.exports = {
    app: app,
    PARAMS: PARAMS,
};
/*
    Controllers Setup
*/
// Require controller modules
const
    ioCtrl = require('./controllers/websockets/io'),
    updaters = require('./controllers/updaters'),
    scriptCtrl = require('./controllers/scriptController'),
    liveVideo = require('./controllers/websockets/liveMediaServer'),
    liveAudio = require('./controllers/websockets/liveMediaServer');
// Socket.io event handlers Setup
ioCtrl(io);
// Live Video Server Setup
liveVideo(new(ws.Server)({
    port: PARAMS.VIDEOWSPORT
}), 'videoStream', PARAMS.VIDEOPORT);
// Live Audio Server Setup
liveAudio(new(ws.Server)({
    port: PARAMS.AUDIOWSPORT
}), 'audioStream', PARAMS.AUDIOPORT);
/*
    Web Server Setup
*/
// Setup request compression (compress all)
app.use(compression());
// Set favicon
app.use(favicon(__dirname + '/public/images/favicon.svg'));
// Setup HTTP Request Logger (morgan).
app.use(logger('dev', {
    //do not log succesfull requests, only errors.
    // skip: function(req, res) {
    //     return res.statusCode < 400
    // }
}));
// Set static route directory to ./public
app.use(express.static(path.join(__dirname, 'public')));
//Setup 404 error handler (if no handler before this is called, url not found)
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// Display error in html.
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send('<h1>Error: ' + err.status + '<br>' + err.message + '</h1>' +
        '<h3>Description: ' + req.url + ' was not found.</h3>');
});
// start server
http.listen(PARAMS.PORT, function() {
    console.log('HRUI: Server ready and listening on Port ' + PARAMS.PORT);
});

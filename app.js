// Define CONSTANTS
const PORT = 80;
const AVCONVPORT = 8000;
const WSPORT = 3000;
const VIDEOWIDTH = 320;
const VIDEOHEIGHT = 240;
const VIDEODEVICE = "/dev/video0"
const AVCONVCMD = "avconv -s 320x240 -f video4linux2 -i " + VIDEODEVICE + " -f mpeg1video -b 200k -r 30 http://localhost:" + AVCONVPORT + "/hrui1311/320/240/";
//const AVCONVCMD = "avconv -f x11grab -s 1366x768 -r 30 -i :0.0 -f mpeg1video -s 320x240 http://localhost:" + AVCONVPORT + "/hrui1311/320/240/"
// get required modules
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const liveVideoServer = new(require('ws').Server)({
    port: WSPORT
});
const monk = require('monk');
const process = require("child_process");
const compression = require('compression');
const favicon = require('serve-favicon');
const logger = require('morgan');
const path = require('path');
// MongoDB Connection Setup (through monk)
const db = monk('localhost:27017/hrui');
const hruiDataDB = db.get('data');
// Socket.io setup
require('./websockets/io').setup(io, AVCONVCMD, hruiDataDB);
// Live Video Server Setup
require('./websockets/liveVideoServer')(liveVideoServer, AVCONVPORT, VIDEOWIDTH, VIDEOHEIGHT);
// App Setup
// compression setup (compress all requests)
app.use(compression());
// set favicon
app.use(favicon(__dirname + '/public/favicon.ico'));
// setup HTTP Request Logger (morgan) with dev style
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
module.exports = app;
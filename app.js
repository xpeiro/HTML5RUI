// Define CONSTANTS
var PORT = 80;
var AVCONVPORT = 8000;
var WSPORT = 3000;
var VIDEOWIDTH = 320;
var VIDEOHEIGHT = 240;
var VIDEODEVICE = "/dev/video0"
var AVCONVCMD = "avconv -s 320x240 -f video4linux2 -i " + VIDEODEVICE + " -f mpeg1video -b 200k -r 30 http://localhost:" + AVCONVPORT + "/hrui1311/320/240/";
//var AVCONVCMD = "avconv -f x11grab -s 1366x768 -r 30 -i :0.0 -f mpeg1video -s 320x240 http://localhost:" + AVCONVPORT + "/hrui1311/320/240/"
// get required modules
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var liveVideoServer = new(require('ws').Server)({
    port: WSPORT
});
var monk = require('monk');
var process = require("child_process");
var compression = require('compression');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var routes = require('./routes/index');
// MongoDB Connection Setup (through monk)
var db = monk('localhost:27017/hrui');
var hruiData = db.get('data');
// Socket.io setup
require('./websockets/io')(io, AVCONVCMD, hruiData);
// Live Video Server Setup
require('./websockets/liveVideoServer')(liveVideoServer, AVCONVPORT, VIDEOWIDTH, VIDEOHEIGHT);
// App Setup
// compression setup (compress all requests)
app.use(compression());
// set favicon
app.use(favicon(__dirname + '/public/favicon.ico'));
// setup HTTP Request Logger (morgan) with dev style
app.use(logger('dev'));
// setup Request BODY parsers: json + urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
// setup cookie parser
app.use(cookieParser());
// set static route directory
app.use(express.static(path.join(__dirname, 'public')));
//set root directory
app.use('/', routes);
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
//Require NodeJS Modules
const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const compression = require('compression');
const favicon = require('serve-favicon');
const logger = require('morgan');
const path = require('path');
const monk = require('monk');
//Set Parameters
const PORT = 80;
const AVCONVPORT = 8000;
const WSPORT = 3000;
const VIDEOWIDTH = 320;
const VIDEOHEIGHT = 240;
const VIDEODEVICE = "/dev/video0"
const AVCONVCMD = "avconv -s "+VIDEOWIDTH+"x"+VIDEOHEIGHT+" -f video4linux2 -i " + VIDEODEVICE + " -f mpeg1video -b 200k -r 30 http://localhost:" + AVCONVPORT + "/hrui1311/"+VIDEOWIDTH+"/"+VIDEOHEIGHT+"/";
//const AVCONVCMD = "avconv -f x11grab -s 1366x768 -r 30 -i :0.0 -f mpeg1video -s 320x240 http://localhost:" + AVCONVPORT + "/hrui1311/320/240/"
// MongoDB Connection Setup
const DB = monk('localhost:27017/hrui');
const HRUIDATADB = DB.get('data');
// Export Parameters (for use in all modules)
module.exports = {
    app: app,
    PORT: PORT,
    AVCONVPORT: AVCONVPORT,
    WSPORT: WSPORT,
    VIDEOWIDTH: VIDEOWIDTH,
    VIDEOHEIGHT: VIDEOHEIGHT,
    AVCONVCMD: AVCONVCMD,
    HRUIDATADB: HRUIDATADB,
}
// Require controller modules
const liveVideo = require('./controllers/websockets/liveVideoServer');
const ioCtrl = require('./controllers/websockets/io');
const updaters = require('./controllers/updaters');
const scriptCtrl = require('./controllers/scriptController');
// Socket.io Setup event handlers
ioCtrl(io);
// Live Video Server Run
liveVideo(new(require('ws').Server)({
    port: WSPORT
}));
// Server Setup
// compression setup (compress all requests)
app.use(compression());
// set favicon
app.use(favicon(__dirname + '/public/images/favicon.ico'));
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


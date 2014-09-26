var PORT = 80;
var WSPORT = 3000;
var FFMPEGPORT = 8000;
var STREAM_MAGIC_BYTES = 'jsmp';
var PASSWORD = "hrui1311"
var VIDEOWIDTH = 320;
var VIDEOHEIGHT = 240;
var FFMPEGCMD = "ffmpeg -s 320x240 -f video4linux2 -i /dev/video1 -f mpeg1video -b 200k -r 30 http://localhost:" + FFMPEGPORT + "/hrui1311/320/240/";
//var PYTHONVREPCNTRL = "python vrepController.py";
// get required modules
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var process = require("child_process");
var monk = require('monk');
var compression = require('compression');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var routes = require('./routes/index');
// Mongodb setup
var db = monk('localhost:27017/hrui');
var collection = db.get('data');
// WebSocket (socket.io) setup
io.on('connection', function(socket) {
    // log user connect
    console.log('a user connected');
    // log user disconnect
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
    // update mongodb with position on updateJoystick message
    socket.on('updateJoystick', function(data) {
        collection.update({
            item: "joystick"
        }, {
            $set: {
                x: data.x,
                y: data.y,
                mode: data.mode,
            }
        });
    });
    socket.on('updateControls', function(data) {
        switch (data.changedControl) {
            case "liveVideoCheckbox":
                if (data.newValue === true) {
                    console.log(FFMPEGCMD);
                    process.exec(FFMPEGCMD, function(error, stdout, stderr) {
                        if ( !! error) {
                            console.log("FFMPEG Error Starting Stream: Already Started or Device not Available");
                        }
                    });
                }
                break;
        }
    });
    update = function(io) {
        collection.findOne({
            "item": "position"
        }, function(err, rec) {
            io.emit('update', rec);
            setTimeout(function() {
                update(io);
            }, 1000);
        });
    };
    update(io);
});
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

/*VIDEO STREAMING CODE by Dominic Szablewski - phoboslab.org, github.com/phoboslab:
  http://phoboslab.org/log/2013/09/html5-live-video-streaming-via-websockets/
*/
var socketServer = new(require('ws').Server)({
    port: WSPORT
});
socketServer.on('connection', function(socket) {
    var streamHeader = new Buffer(8);
    streamHeader.write(STREAM_MAGIC_BYTES);
    streamHeader.writeUInt16BE(VIDEOWIDTH, 4);
    streamHeader.writeUInt16BE(VIDEOHEIGHT, 6);
    socket.send(streamHeader, {
        binary: true
    });
    console.log('New WebSocket Connection (' + socketServer.clients.length + ' total)');
    socket.on('close', function(code, message) {
        console.log('Disconnected WebSocket (' + socketServer.clients.length + ' total)');
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
//END OF PHOBOSLAB CODE
/* 
FFMPEG Commands:
 
From dev file:

ffmpeg -s 320x240 -f video4linux2 -i /dev/video0 -f mpeg1video -b 800k -r 30 http://localhost:8000/hrui1311/320/240/

From x11grab (screen capture):

ffmpeg -f x11grab -s 1366x768 -r 30 -i :0.0 -f mpeg1video -s 320x240 http://localhost:8000/hrui1311/320/240/


*/

module.exports = app;
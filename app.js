var port = 80;
// get required modules
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
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
                y: data.y
            }
        });
    });
    update = function(io) {
        collection.findOne({
            "item": "position"
        }, function(err, rec) {
            io.emit('update', rec);
            setTimeout(function() {
                update(io);
            }, 10);
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
http.listen(port, function() {
    console.log('listening on *:' + port);
});
module.exports = app;
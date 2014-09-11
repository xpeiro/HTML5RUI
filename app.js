var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');

// mongodb setup
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/HRUI');

// socket.io setup
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 80;

// view engine setup (jade)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app setup
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

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

// WebSocket setup
io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('hello', function(data) {
  	var collection = db.get('data');
  	collection.update(
    { item: "position" },
    { $set: { x: data.x, y: data.y } }
    )
  });

});

// start server
http.listen(port, function(){
  console.log('listening on *:'+port);
});

module.exports = app;

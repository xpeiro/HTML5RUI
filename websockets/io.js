// Socket.IO Event Configuration
var process = require("child_process");
module.exports = function(io, FFMPEGCMD, hruiData) {
    io.clients = 0;
    io.on('connection', function(socket) {
        // log user connect
        var numberofUsers = 0;
        // numberofUsers++;
        io.clients++;
        console.log('A User Connected. (' + io.clients + ' total)');
        // log user disconnect
        socket.on('disconnect', function() {
            io.clients--;
            console.log('A User Disconnected. (' + io.clients + ' total)');
        });
        // update mongodb with position on updateJoystick message
        socket.on('updateJoystick', function(data) {
            hruiData.update({
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
                        process.exec(FFMPEGCMD, function(error, stdout, stderr) {
                            if ( !! error) {
                                switch (error.code) {
                                    case 255:
                                        console.log("FFMPEG: Killed Process");
                                        break;
                                    case 1:
                                        console.log("FFMPEG: Device Not Found or Already Streaming");
                                        break;
                                }
                            }
                        });
                    }
                    break;
            }
        });
        update = function(io) {
            hruiData.findOne({
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
}
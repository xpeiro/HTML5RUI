// Socket.IO Event Configuration
// get updater module
require('../controllers/updaters');

// get data and send to front-end
updateData = function(io, hruiData) {
    hruiData.findOne({
        "item": "position"
    }, function(err, rec) {
        io.emit('update', rec);
        setTimeout(function() {
            updateData(io, hruiData);
        }, 100);
    });
};

// hook events to updater handlers
module.exports = function(io, FFMPEGCMD, hruiData) {
    io.clients = 0;
    io.on('connection', function(socket) {
        // log user connect
        io.clients++;
        console.log('A User Connected. (' + io.clients + ' total)');
        // log user disconnect
        socket.on('disconnect', function() {
            io.clients--;
            console.log('A User Disconnected. (' + io.clients + ' total)');
        });
        // update mongodb with joystick position
        socket.on('updateJoystick', function(data) {
            updateJoystick(data, hruiData);
        });
        //update currently selected HRUI Controls
        socket.on('updateControls', function(data) {
            updateControls(data, FFMPEGCMD);
        });
        // periodic Data update
        updateData(io, hruiData);
    });
}
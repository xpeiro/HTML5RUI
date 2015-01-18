// Socket.IO Event Configuration
// get updater module
var updaters = require('../controllers/updaters');
// hook events to updater handlers
module.exports = function(io, AVCONVCMD, hruiDataDB) {
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
            updaters.updateJoystick(data, hruiDataDB);
        });
        //update currently selected HRUI Controls
        socket.on('updateControls', function(data) {
            updaters.updateControls(data, AVCONVCMD);
        });
        // function to send robot data to front end when called
        sendData = function(data) {
            socket.emit('updateData', data);
        };
        // set off periodic data update
        periodicUpdate(hruiDataDB, sendData);
    });
};
// calls updaters.updateData every 100 ms
periodicUpdate = function(hruiDataDB, sendDataFunction) {
    updaters.updateData(hruiDataDB, sendDataFunction);
    setTimeout(function() {
        periodicUpdate(hruiDataDB, sendDataFunction);
    }, 100);
};
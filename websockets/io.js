// Socket.IO Event Configuration
// get updater module
var updaters = require('../controllers/updaters');
// hook events to updater handlers
module.exports = {
    setup: function(io, AVCONVCMD, hruiDataDB) {
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
            //recieve custom data identifier and update interval
            socket.on('customDataFormSubmitted', function(data) {
                updaters.customDataSetup(data);
            });
            // function to send an event with associated data to front end when called
            sendData = function(event, data) {
                socket.emit(event, data);
            };
            // set off periodic data update
            updaters.periodicUpdate(hruiDataDB, sendData);
            
        });
    },
};
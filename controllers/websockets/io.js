// Socket.IO Event Configuration
var socket;
// function to send an event with associated data to front end when called
var sendData = function(event, data) {
    socket.emit(event, data);
};
// Export sendData function
module.exports.sendData = sendData;
// get updater module
const updaters = require('../updaters');
const scriptCtrl = require('../scriptController');
// Setup Event hooks to Handlers
module.exports = function(io) {
    io.clients = 0;
    io.on('connection', function(newsocket) {
        socket = newsocket;
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
            updaters.updateJoystick(data);
        });
        //update currently selected HRUI Controls
        socket.on('updateControls', function(data) {
            updaters.updateControls(data);
        });
        //recieve custom data identifier and update interval
        socket.on('customDataFormSubmitted', function(data) {
            updaters.customDataSetup(data);
        });
        //recieve customInputData
        socket.on('updateCustomInput', function(data) {
            updaters.updateCustomInput(data);
        });
        //get profiles from DB when requested
        socket.on('fetchProfiles', function() {
            updaters.fetchProfiles();
        });
        //recieve profile to save
        socket.on('saveProfile', function(data) {
            updaters.saveProfile(data);
        });
        //fetch Scripts
        socket.on('fetchScripts', function() {
            updaters.fetchScripts();
        });
        //run Script
        socket.on('runScript', function(data) {
            scriptCtrl.runScript(data);
        });
        //kill Script
        socket.on('killScript', function(data) {
            scriptCtrl.killScript(data);
        });
        // set off periodic data update
        updaters.periodicUpdate();
    });
};

/*
    HTML5 Robot User Interface Server
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

/* Socket.IO Event Configuration */
var socket;
// function to send an event with associated data to front end when called
function sendData(event, data) {
    socket.emit(event, data);
};
module.exports.sendData = sendData; // Export for transparent data sending in other modules
// get required modules
const app = require('../../app');
const updaters = require('../updaters');
const scriptCtrl = require('../scriptController');
// Setup Event hooks to Handlers
module.exports = function(io) {
    io.clients = 0;
    io.on('connection', function(newsocket) {
        socket = newsocket;
        // log user connect
        io.clients++;
        console.log('HRUI IO: A User Connected. (' + io.clients + ' concurrent)');
        updaters.setClientsAreConnected(true);
        //Send App Parameters to front-end
        sendData('initParams', {
            VIDEOWSPORT: app.PARAMS.VIDEOWSPORT,
            AUDIOWSPORT: app.PARAMS.AUDIOWSPORT,
            VIDEODEVICE: parseInt(app.PARAMS.VIDEODEVICE.replace('video', '')),
        });
        // log user disconnect
        socket.on('disconnect', function() {
            io.clients--;
            console.log('HRUI IO: A User Disconnected. (' + io.clients + ' concurrent)');
            //if all clients disconnected, kill all running scripts/streams (safeguard, may be removed),
            //and stop periodic updates
            if (io.clients == 0) {
                scriptCtrl.killAllScripts();
                scriptCtrl.killStream('audioStream');
                scriptCtrl.killStream('videoStream');
                updaters.setClientsAreConnected(false);
            };
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
        //media Device Selected
        socket.on('mediaDeviceSelected', function(data) {
            scriptCtrl.changeMediaDevice(data);
        });
        //set new Map Mode
        socket.on('setMapMode', function(data) {
            updaters.setMapMode(data);
        });
    });
};

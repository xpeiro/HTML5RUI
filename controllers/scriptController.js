/*
    HTML5 Robot User Interface Server
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

// Backend Script Controller: Spawns and kills child processes on client request.
const app = require('../app');
const io = require('./websockets/io');
const spawn = require("child_process").spawn;
const AVCONV = app.AVCONV;
const DEV = app.DEV;
const VIDEOARGS = app.VIDEOARGS;
const AUDIOARGS = app.AUDIOARGS;
var scripts = {};
var streams = {
    audioStream: {
        ARGS: AUDIOARGS,
        proc: null,
    },
    videoStream: {
        ARGS: VIDEOARGS,
        proc: null,
    },
};
// Run AVCONV when live video/audio is toggled on. Log when the processed is killed.
var runStream = function(streamType) {
    //stream from audio/video device.
    if (!streams[streamType].proc) {
        streams[streamType].proc = spawn(AVCONV, streams[streamType].ARGS);
        //on process exit, report cause.
        streams[streamType].proc.on('close', function(code) {
            if (!!code) {
                switch (code) {
                    case 255:
                        console.log(streamType + ': Process Killed');
                        break;
                    case 1:
                        console.log(streamType + ': Device Not Found or Already Streaming');
                        break;
                };
            };
        });
    };

};
var killStream = function(streamType) {
    if (!!streams[streamType].proc) {
        streams[streamType].proc.kill('SIGINT');
        streams[streamType].proc = null;
    };
};
var runScript = function(scriptName) {
    //check for type of script (check for stuff like 'trickyscript.js.py')
    if (scriptName.lastIndexOf(".py") > scriptName.lastIndexOf(".js")) {
        scripts[scriptName] = spawn('python', ["userscripts/" + scriptName]);
    } else if (scriptName.lastIndexOf(".js") > scriptName.lastIndexOf(".py")) {
        scripts[scriptName] = spawn('node', ["userscripts/" + scriptName]);
    };
    //on script exit, notify front-end
    scripts[scriptName].on('close', function(code) {
        io.sendData('scriptError', scriptName);
        console.log('Script exited: ' + scriptName);
    });
    //send stdout and stderr to front-end
    scripts[scriptName].stdout.on('data', function(data) {
        io.sendData('scriptStdout', scriptName + ': ' + ab2str(data));
    });
    scripts[scriptName].stderr.on('data', function(data) {
        io.sendData('scriptStderr', scriptName + ': ' + ab2str(data));
    });
    //notify front-end of script running
    io.sendData('scriptRunning', scriptName);
    console.log('Script spawned: ' + scriptName);
};
var killScript = function(scriptName) {
    if (!!scripts[scriptName]) {
        scripts[scriptName].kill('SIGINT');
        console.log('Script killed: ' + scriptName);
    };
};
var killAllScripts = function() {
    for (var scriptName in scripts) {
        killScript(scriptName);
    };
};
//Rewrite arguments passed to avconv when user selects new video device
//Note: can be used to implement same feature in audio stream, deemed unnecessary.
var changeMediaDevice = function(media) {
    killStream(media.streamType);
    var args = streams[media.streamType].ARGS;
    if (media.streamType == 'videoStream') {
        args[args.indexOf('-i') + 1] = DEV + 'video' + media.deviceNum;
    } //add 'else' for audio here, if needed. Modifications to liveaudio.js also required (see livevideo.js)
    runStream(media.streamType);
};
//Convert Array Buffer to String Function (credit: Renato Mangini, 
//http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String)
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
};
//Export methods for use in other modules
module.exports = {
    runStream: runStream,
    killStream: killStream,
    runScript: runScript,
    killScript: killScript,
    killAllScripts: killAllScripts,
    changeMediaDevice: changeMediaDevice,
};

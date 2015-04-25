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
//get commands
const NODE = app.PARAMS.NODE;
const PYTHON = app.PARAMS.PYTHON;
const AVCONV = app.PARAMS.AVCONV;
//get dev directory
const DEV = app.PARAMS.DEV;
//get initial video device
const INITVIDDEV = DEV + app.PARAMS.VIDEODEVICE;
//init objects holding the running scripts and streams.
var scripts = {};
var streams = {
    audioStream: {
        ARGS: app.PARAMS.AUDIOARGS,
        proc: null,
    },
    videoStream: {
        ARGS: app.PARAMS.VIDEOARGS,
        proc: null,
    },
};
// Run AVCONV when live video/audio is toggled on. Log when the processed is killed.
function runStream(streamType) {
    //stream from audio/video device.
    if (!streams[streamType].proc) {
        streams[streamType].proc = spawn(AVCONV, streams[streamType].ARGS);
        //on process exit, report cause.
        streams[streamType].proc.on('close', function(code) {
            if (!!code) {
                switch (code) {
                    case 255:
                        console.log('HRUI Media: ' + streamType + ' process Killed');
                        break;
                    case 1:
                        console.log('HRUI Media: ' + streamType + ' device Not Found or Already Streaming');
                        break;
                };
            };
        });
    };

};

function killStream(streamType) {
    if (!!streams[streamType].proc) {
        streams[streamType].proc.kill('SIGINT');
        streams[streamType].proc = null;
    };
};

function runScript(scriptName) {
    //check for type of script (check for stuff like 'trickyscript.js.py')
    if (scriptName.lastIndexOf(".py") > scriptName.lastIndexOf(".js")) {
        //spawn python script
        scripts[scriptName] = spawn(PYTHON, ["userscripts/" + scriptName]);
    } else if (scriptName.lastIndexOf(".js") > scriptName.lastIndexOf(".py")) {
        //spawn node script
        scripts[scriptName] = spawn(NODE, ["userscripts/" + scriptName]);
    };
    //on script exit, notify front-end
    scripts[scriptName].on('close', function(code) {
        io.sendData('scriptError', scriptName);
        scripts[scriptName] = null;
        console.log('HRUI Scripts: ' + scriptName + ' exited');
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
    console.log('HRUI Scripts: ' + scriptName + ' spawned');
};

function killScript(scriptName) {
    if (!!scripts[scriptName]) {
        scripts[scriptName].kill('SIGINT');
        console.log('HRUI Scripts: ' + scriptName + ' killed');
    };
};

function killAllScripts() {
    for (var scriptName in scripts) {
        killScript(scriptName);
    };
};
//Rewrite arguments passed to avconv when user selects new video device
//Note: can be used to implement same feature in audio stream, deemed unnecessary.
function changeMediaDevice(media) {
    killStream(media.streamType);
    var args = streams[media.streamType].ARGS;
    if (media.streamType == 'videoStream') {
        if (media.deviceNum != 'init') {
            args[args.indexOf('-i') + 1] = DEV + 'video' + media.deviceNum;
            runStream(media.streamType);
        } else //if 'init' passed as device number, resets to initial video device (as per app.js params)
            args[args.indexOf('-i') + 1] = INITVIDDEV;
    } //add 'else' for audio here, if needed. Modifications to liveaudio.js also required (see livevideo.js)

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

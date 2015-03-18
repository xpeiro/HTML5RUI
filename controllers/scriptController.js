// Backend Script Controller
const app = require('../app');
const io = require('./websockets/io');
const process = require("child_process");
const AVCONV = app.AVCONV;
const VIDEOARGS = app.VIDEOARGS;
const AUDIOARGS = app.AUDIOARGS;
var scripts = {};
var streams = {
    audioStream: {
        ARGS: AUDIOARGS,
        proc: {},
    },
    videoStream: {
        ARGS: VIDEOARGS,
        proc: {},
    },
};
// Run AVCONV when live video is toggled on. Log when the processed is killed (liveVideoServer.js).
module.exports = {
    runStream: function(streamType) {
        //stream from audio/video device.
        streams[streamType].proc = process.spawn(AVCONV, streams[streamType].ARGS);
        //on process exit, report cause.
        streams[streamType].proc.on('close', function(code, signal) {
            if (!!signal) {
                console.log(streamType + ' Closed on ' + signal + ' received');
            };
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
    },

    runScript: function(scriptName) {
        //check for type of script (check for stuff like 'trickyscript.js.py')
        if (scriptName.indexOf(".py") > 0 && scriptName.lastIndexOf(".py") > scriptName.lastIndexOf(".js")) {
            scripts[scriptName] = process.spawn('python', ["userscripts/" + scriptName]);
        } else if (scriptName.indexOf(".js") > 0 && scriptName.lastIndexOf(".js") > scriptName.lastIndexOf(".py")) {
            scripts[scriptName] = process.spawn('node', ["userscripts/" + scriptName]);
        };
        //on script exit, notify front-end
        scripts[scriptName].on('close', function(code) {
            io.sendData('scriptError', scriptName);
        });
        //send stdout and stderr to front-end
        scripts[scriptName].stdout.on('data', function(data) {
            io.sendData('scriptStdout', ab2str(data));
        });
        scripts[scriptName].stderr.on('data', function(data) {
            io.sendData('scriptStderr', ab2str(data));
        });
        //notify front-end of script running
        io.sendData('scriptRunning', scriptName);
    },
    killScript: function(scriptName) {
        scripts[scriptName].kill('SIGINT');
    },
    killAllScripts: function() {
        for (var scriptName in scripts) {
            scripts[scriptName].kill('SIGINT');
        };
    },
};
//Convert Array Buffer to String (credit: Renato Mangini, 
//http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String)
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

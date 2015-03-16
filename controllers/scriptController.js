// Backend Script Controller
const app = require('../app');
const io = require('./websockets/io');
const process = require("child_process");
const avconvcmd = app.AVCONVCMD;
var processes = {};
// Run AVCONV when live video is toggled on. Log when the processed is killed (liveVideoServer.js).
module.exports = {
    runavconv: function() {
        process.exec(avconvcmd, function(error, stdout, stderr) {
            if (!!error) {
                switch (error.code) {
                    case 255:
                        console.log("AVCONV: Killed Process");
                        break;
                    case 1:
                        console.log("AVCONV: Device Not Found or Already Streaming");
                        break;
                };
            };
        });
    },
    runScript: function(scriptName) {
        //check for type of script (check for stuff like 'trickyscript.js.py')
        if (scriptName.indexOf(".py") > 0 && scriptName.lastIndexOf(".py") > scriptName.lastIndexOf(".js")) {
            processes[scriptName] = process.spawn('python', ["utils/" + scriptName]);
        } else if (scriptName.indexOf(".js") > 0 && scriptName.lastIndexOf(".js") > scriptName.lastIndexOf(".py")) {
            processes[scriptName] = process.spawn('node', ["utils/" + scriptName]);
        };
        //on script exit, notify front-end
        processes[scriptName].on('close', function(code) {
            io.sendData('scriptError', scriptName);
        });
        //send stdout and stderr to front-end
        processes[scriptName].stdout.on('data', function(data) {
            io.sendData('scriptStdout', ab2str(data));
        });
        processes[scriptName].stderr.on('data', function(data) {
            io.sendData('scriptStderr', ab2str(data));
        });
        //notify front-end of script running
        io.sendData('scriptRunning', scriptName);
    },
    killScript: function(scriptName) {
        processes[scriptName].kill('SIGINT');
    },
    killAllScripts: function() {
        for (var proc in processes) {
            processes[proc].kill('SIGINT');
        };
    },
};
//Convert Array Buffer to String (credit: Renato Mangini, 
//http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String)
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

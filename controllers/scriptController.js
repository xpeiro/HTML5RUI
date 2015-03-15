// Backend Script Controller
const app = require('../app');
const io = require('./websockets/io');
const process = require("child_process");
const avconvcmd = app.AVCONVCMD;
var processes = {};
var sendError = function(error, stdout, stderr) {
    if (!!error) {

        io.sendData('scriptError', {
            stdout: stdout,
            stderr: stderr,
        });
    };
};
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
            processes[scriptName] = process.exec("python utils/" + scriptName, sendError);
            console.log(processes[scriptName].pid);
        } else if (scriptName.indexOf(".js") > 0 && scriptName.lastIndexOf(".js") > scriptName.lastIndexOf(".py")) {
            processes[scriptName] = process.exec("node utils/" + scriptName, sendError);
        };

    },
    killScript: function(scriptName) {
        var pid = processes[scriptName].pid + 1;
        process.exec("kill " + pid, function(error, stdout, stderr) {

        });

    },
};

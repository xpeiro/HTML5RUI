var process = require("child_process");

updateJoystick = function(data, hruiData) {
    hruiData.update({
        item: "joystick"
    }, {
        $set: {
            x: data.x,
            y: data.y,
            mode: data.mode,
        }
    });
}
updateControls = function(data, FFMPEGCMD) {
    switch (data.changedControl) {
        case "liveVideoCheckbox":
            if (data.newValue === true) {
                process.exec(FFMPEGCMD, function(error, stdout, stderr) {
                    if ( !! error) {
                        switch (error.code) {
                            case 255:
                                console.log("FFMPEG: Killed Process");
                                break;
                            case 1:
                                console.log("FFMPEG: Device Not Found or Already Streaming");
                                break;
                        }
                    }
                });
            }
            break;
    }
}

var process = require("child_process");
module.exports = {
    updateJoystick: function(data, hruiData) {
        hruiData.update({
            item: "joystick"
        }, {
            $set: {
                x: data.x,
                y: data.y,
                mode: data.mode,
            }
        });
    },
    updateControls: function(data, AVCONVCMD) {
        switch (data.changedControl) {
            case "liveVideoCheckbox":
                if (data.newValue === true) {
                    process.exec(AVCONVCMD, function(error, stdout, stderr) {
                        if ( !! error) {
                            switch (error.code) {
                                case 255:
                                    console.log("AVCONV: Killed Process");
                                    break;
                                case 1:
                                    console.log("AVCONV: Device Not Found or Already Streaming");
                                    break;
                            }
                        }
                    });
                }
                break;
        }
    },
    updateData: function(hruiData, updateDataCallback) {
        hruiData.findOne({
            "item": "robotData"
        }, function(err, data) {
            updateDataCallback(data);
        });
    }
}
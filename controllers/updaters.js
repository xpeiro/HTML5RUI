var process = require("child_process");
module.exports = {
    //update MongoDB with joystick coordinates
    updateJoystick: function(data, hruiDataDB) {
        hruiDataDB.update({
            item: "joystick"
        }, {
            $set: {
                x: data.x,
                y: data.y,
                mode: data.mode,
            }
        });
    },
    // Run or kill avconv when live video is toggled
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
    //get robot data from MongoDB and call data sending function
    updateData: function(hruiDataDB, sendDataFunction) {
        hruiDataDB.findOne({
            "item": "robotData"
        }, function(err, data) {
            sendDataFunction(data);
        });
    }
}
var process = require("child_process");

// updates Data every 100 ms
var updateData = function(hruiDataDB, sendData) {
        hruiDataDB.findOne({
            "item": "robotData"
        }, function(err, data) {
            sendData('updateData',data);
        });
        setTimeout(function() {
            updateData(hruiDataDB, sendData);
        }, 100);
    };
// updates Geolocation every 5000 ms
var updateGeolocation = function(hruiDataDB, sendData) {
        hruiDataDB.findOne({
            "item": "robotGeolocation"
        }, function(err, data) {
            sendData('updateGeolocation',data);
        });
        setTimeout(function() {
            updateGeolocation(hruiDataDB, sendData);
        }, 2000);
    };

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

    updateData: updateData,

    updateGeolocation: updateGeolocation,
};
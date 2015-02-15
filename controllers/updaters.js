var process = require("child_process");
//gets data from Database associated to given item and fires an event to front-end with the requested data.
var update = function(hruiDataDB, sendData, item, eventname) {
    hruiDataDB.findOne({
        "item": item
    }, function(err, data) {
        sendData(eventname, data);
    });
}
// fires updates for robot data periodically (in increments of 100ms, defined with multipliers)
var periodicUpdate = function(hruiDataDB, sendData, geoMultiplier) {
    //get robot data
    update(hruiDataDB, sendData, "robotData", 'updateData');
    if (geoMultiplier == 0) {
        //get geolocation data (every 2000ms)
        update(hruiDataDB, sendData, "robotGeolocation", 'updateGeolocation');
        geoMultiplier = 20;
    };
    setTimeout(function() {
        periodicUpdate(hruiDataDB, sendData, geoMultiplier - 1);
    }, 100);
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
    periodicUpdate: periodicUpdate,
};
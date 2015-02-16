var process = require("child_process");
const INTERVALINCREMENT = 100;
const GEOMULTIPLIER = 20;
var geoMultiplier = GEOMULTIPLIER;
var customdata = {
    item: "",
    updateInterval: INTERVALINCREMENT,
    MULTIPLIER: 1,
    multiplier: 1,
};
//gets data from Database associated to given item and fires an event to front-end with the requested data.
var update = function(hruiDataDB, sendData, item, eventname) {
    hruiDataDB.findOne({
        "item": item
    }, function(err, data) {
        sendData(eventname, data);
    });
}
// fires updates for robot data periodically (in increments of INTERVALINCREMENT ms, defined with multipliers)
var periodicUpdate = function(hruiDataDB, sendData) {
    //get robot data
    update(hruiDataDB, sendData, "robotData", 'updateData');
    console.log(customdata);
    if (customdata.multiplier == 0) {
        customdata.multiplier = customdata.MULTIPLIER + 1;
    };
    if (geoMultiplier == 0) {
        //get geolocation data (every 2000ms)
        update(hruiDataDB, sendData, "robotGeolocation", 'updateGeolocation');
        geoMultiplier = GEOMULTIPLIER + 1;
    };
    setTimeout(function() {
        geoMultiplier--;
        customdata.multiplier--;
        periodicUpdate(hruiDataDB, sendData);
    }, INTERVALINCREMENT);
};
var customdataSetup = function(recievedCustomdata) {
    customdata.item = recievedCustomdata.item;
    customdata.updateInterval = recievedCustomdata.updateInterval;
    customdata.MULTIPLIER = Math.floor(customdata.updateInterval / INTERVALINCREMENT);
    if (customdata.MULTIPLIER == 0) {
        customdata.MULTIPLIER = 1;
    } else if (customdata.updateInterval % INTERVALINCREMENT >= 50) {
        customdata.MULTIPLIER++;
    };
    customdata.multiplier = customdata.MULTIPLIER;
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
    customdataSetup: customdataSetup,
};
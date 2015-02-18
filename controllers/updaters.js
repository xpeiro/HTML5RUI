const process = require("child_process");
const INTERVALINCREMENT = 100;
const GEOMULTIPLIER = 20;
var geoMultiplier = GEOMULTIPLIER;
var customData = {
    item: "",
    updateInterval: INTERVALINCREMENT,
    MULTIPLIER: -1,
    multiplier: -1,
};
//gets data from Database associated to given item and calls io to fire an event to front-end with the requested data
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
    //get custom data (if requested)
    if (customData.multiplier == 0) {
        update(hruiDataDB, sendData, customData.item, 'updateCustomdata');
        customData.multiplier = customData.MULTIPLIER + 1;
    };
    //get geolocation data (when requested)
    if (geoMultiplier == 0) {
        update(hruiDataDB, sendData, "robotGeolocation", 'updateGeolocation');
        geoMultiplier = GEOMULTIPLIER + 1;
    };
    setTimeout(function() {
        if (customData.multiplier > 0) {
            customData.multiplier--;
        };
        geoMultiplier--;
        periodicUpdate(hruiDataDB, sendData);
    }, INTERVALINCREMENT);
};
var customDataSetup = function(recievedCustomdata) {
    customData.item = recievedCustomdata.item;
    customData.updateInterval = recievedCustomdata.updateInterval;
    customData.MULTIPLIER = Math.floor(customData.updateInterval / INTERVALINCREMENT);
    if (customData.MULTIPLIER == 0) {
        customData.MULTIPLIER = 1;
    } else if (customData.updateInterval % INTERVALINCREMENT >= 50) {
        customData.MULTIPLIER++;
    };
    customData.multiplier = customData.MULTIPLIER;
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
    updateControls: function(changedControldata, AVCONVCMD) {
        switch (changedControldata.changedControl) {
            // Run AVCONV when live video is toggled on. Log when the processed is killed (liveVideoServer.js).
            case "liveVideoCheckbox":
                if (changedControldata.newValue === true) {
                    process.exec(AVCONVCMD, function(error, stdout, stderr) {
                        if (!!error) {
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
                //Deactivate custom data update (by resetting the multiplier to -1) when custom data is toggle off.
            case "customDataCheckbox":
                if (changedControldata.newValue === false) {
                    customData = {
                        item: "",
                        updateInterval: INTERVALINCREMENT,
                        MULTIPLIER: -1,
                        multiplier: -1,
                    };
                };
                break;
        }
    },
    periodicUpdate: periodicUpdate,
    customDataSetup: customDataSetup,
};
//DataBase and Back-end Process Controllers
const process = require("child_process");
const INTERVALINCREMENT = 100;
const GEOMULTIPLIER = 20;
var avconvcmd;
var hruiDataDB;
var geoMultiplier = -1;
var customData = {
    item: "",
    updateInterval: INTERVALINCREMENT,
    MULTIPLIER: -1,
    multiplier: -1,
};
//gets data from Database associated to given item
//and calls io to fire an event to front-end with the requested data
//using the callback funcion 'sendData' (in websockets/io.js)
var update = function(sendData, item, eventname) {
    hruiDataDB.findOne({
        "item": item
    }, function(err, data) {
        sendData(eventname, data);
    });
};
// fires updates for robot data periodically (in increments of INTERVALINCREMENT ms, defined with multipliers)
var periodicUpdate = function(sendData) {
    //get robot data
    update(sendData, "robotData", 'updateData');
    //get custom data (if requested)
    if (customData.multiplier == 0) {
        update(sendData, customData.item, 'updateCustomdata');
        customData.multiplier = customData.MULTIPLIER + 1;
    };
    //get geolocation data (when requested)
    if (geoMultiplier == 0) {
        update(sendData, "robotGeolocation", 'updateGeolocation');
        geoMultiplier = GEOMULTIPLIER + 1;
    };
    //fire periodic timeout
    setTimeout(function() {
        if (customData.multiplier > 0) {
            customData.multiplier--;
        };
        if (geoMultiplier > 0) {
            geoMultiplier--;
        };
        periodicUpdate(sendData);
    }, INTERVALINCREMENT);
};
//setup customData requested item and requested interval
var customDataSetup = function(recievedCustomdata) {
    customData.item = recievedCustomdata.item;
    customData.updateInterval = recievedCustomdata.updateInterval;
    //round recieved multiplier to 100ms with a 100ms floor
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
    updateJoystick: function(joystickData) {
        hruiDataDB.update({
            item: "joystick"
        }, {
            $set: {
                _id: 0,
                x: joystickData.x,
                y: joystickData.y,
                mode: joystickData.mode,
            }
        }, {
            upsert: true
        });
    },
    updateControls: function(changedControlData) {
        switch (changedControlData.changedControl) {
            // Run AVCONV when live video is toggled on. Log when the processed is killed (liveVideoServer.js).
            case "liveVideoCheckbox":
                if (changedControlData.newValue === true) {
                    process.exec(avconvcmd, function(error, stdout, stderr) {
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
                if (changedControlData.newValue === false) {
                    customData = {
                        item: "",
                        updateInterval: INTERVALINCREMENT,
                        MULTIPLIER: -1,
                        multiplier: -1,
                    };
                };
                break;
                //Activate or Deactivate geolocation update when geolocation control is toggled
            case "geolocationCheckbox":
                if (changedControlData.newValue === true) {
                    geoMultiplier = GEOMULTIPLIER;
                } else {
                    geoMultiplier = -1;
                }
                break;
        }
    },
    updateCustomInput: function(customInput) {
        hruiDataDB.update({
            item: customInput.item
        }, {
            $set: customInput
        }, {
            upsert: true
        });
    },
    //get profiles from DB and fire event with data to front-end
    fetchProfiles: function(sendData) {
        update(sendData, 'profiles', 'fetchedProfiles');
    },
    saveProfile: function(profile) {
        setObj = {
            $set: {

            }
        };
        setObj.$set[profile.name] = profile;
        setObj.$set._id = 4;
        hruiDataDB.update({
            item: "profiles"
        }, setObj, {
            upsert: true
        });
    },
    setup: function(HRUIDATADB, AVCONVCMD) {
        hruiDataDB = HRUIDATADB;
        avconvcmd = AVCONVCMD;
    },
    periodicUpdate: periodicUpdate,
    customDataSetup: customDataSetup,
};

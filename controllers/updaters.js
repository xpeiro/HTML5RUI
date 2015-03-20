/*
    HTML5 Robot User Interface Server
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

//DataBase Controller
const app = require('../app');
const fs = require("fs");
const io = require('./websockets/io');
const scriptCtrl = require('./scriptController');
const INTERVALINCREMENT = 100;
const GEOMULTIPLIER = 20;
const hruiDataDB = app.HRUIDATADB;
var geoMultiplier = -1;
var customData = {
    item: "",
    updateInterval: INTERVALINCREMENT,
    MULTIPLIER: -1,
    multiplier: -1,
};
//gets data from Database associated to given item
//and calls io to fire an event to front-end with the requested data
//using the callback funcion 'io.sendData' (in websockets/io.js)
var update = function(item, eventname) {
    hruiDataDB.findOne({
        "item": item
    }, function(err, data) {
        io.sendData(eventname, data);
    });
};
// fires updates for robot data periodically (in increments of INTERVALINCREMENT ms, defined with multipliers)
var periodicUpdate = function() {
    //get robot data
    update("robotData", 'updateData');
    //get custom data (if requested)
    if (customData.multiplier == 0) {
        update(customData.item, 'updateCustomdata');
        customData.multiplier = customData.MULTIPLIER + 1;
    };
    //get geolocation data (when requested)
    if (geoMultiplier == 0) {
        update("robotGeolocation", 'updateGeolocation');
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
        periodicUpdate();
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
//fetch available scripts in userscripts/
var fetchScripts = function() {
    //reads files in userscripts dir and asynchronously calls updateScripts
    fs.readdir("userscripts/", updateScripts);
};
//parses files in userscripts/ for python/node scripts and sends list to front-end
var updateScripts = function(err, files) {
    var scripts = [];
    var j = 0;
    for (var i = 0; i < files.length; i++) {
        if (files[i].indexOf(".py") > 0 || files[i].indexOf(".js") > 0) {
            scripts[j] = files[i];
            j++;
        };
    };
    io.sendData('fetchedScripts', scripts);
};
//export methods to be accessed from other modules
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
            case "scriptExecCheckbox":
                if (changedControlData.newValue === false) {
                    scriptCtrl.killAllScripts();
                };
        };
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
    fetchProfiles: function() {
        update('profiles', 'fetchedProfiles');
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
    periodicUpdate: periodicUpdate,
    customDataSetup: customDataSetup,
    fetchScripts: fetchScripts,
};

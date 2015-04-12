/*
    HTML5 Robot User Interface Server
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

/*
DataBase and File Controller.
Handles database queries and updates
on request from front end.
Manages userscripts file list.
*/
const app = require('../app');
const path = require('path');
const fs = require("fs");
const busboy = require('connect-busboy');
const io = require('./websockets/io');
const scriptCtrl = require('./scriptController');
const PNG = require('pngjs').PNG;
const hruiDataDB = app.PARAMS.HRUIDATADB;
const INTERVALINCREMENT = 100;
const GEOMULTIPLIER = 20;
const MAPDATAMULTIPLIER = 5;
const MAPWIDTH = 300;
const MAPHEIGHT = 300;
var geoMultiplier = -1;
var mapDataMultiplier = -1;
var dataMonitorOn = false;
var clientsAreConnected = false;
var allwhite = false;
var customData = {
    item: "",
    updateInterval: INTERVALINCREMENT,
    MULTIPLIER: -1,
    multiplier: -1,
};
//Setup http get request for map, so that browser doesn't cache every png it gets.
app.app.get('/images/map.png', function(req, res) {
    res.setHeader("Cache-control", "no-cache");
    res.sendFile(path.join(__dirname, '../public/images/map.png'));
});
//Setup map upload http response
app.app.use(busboy());
app.app.post('/mapupload', function(req, res) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function(fieldname, file, filename) {
        console.log("Uploading: " + filename + ' to public/images/uploadmap');
        fstream = fs.createWriteStream(__dirname + '/../public/images/uploadmap');
        file.pipe(fstream);
        fstream.on('close', function() {
            res.send('Uploaded');
            console.log("Uploaded: " + filename + ' succesfully');
            io.sendData('mapUploaded');
        });
    });
});
//Start Periodic updates
periodicUpdate();

//gets data from Database associated to given item
//and fires an event called eventname to front-end 
//with the requested data using websockets/io.js
function getAndSendAs(item, eventname) {
    hruiDataDB.findOne({
        "item": item
    }, function(err, data) {
        io.sendData(eventname, data);
    });
};
// fires updates for robot data periodically (in increments of INTERVALINCREMENT ms, defined with multipliers)
function periodicUpdate() {
    if (clientsAreConnected) {

        if (dataMonitorOn) {
            //get robot data
            getAndSendAs("robotData", 'updateData');
            //generate map data (if requested)
            if (mapDataMultiplier == 0) {
                hruiDataDB.findOne({
                    "item": "mapData"
                }, function(err, data) {
                    buildMap(err, data);
                });
                mapDataMultiplier = MAPDATAMULTIPLIER;
            } else if (mapDataMultiplier > 0) {
                mapDataMultiplier--;
            };
        };
        //get custom data (if requested)
        if (customData.multiplier == 0) {
            getAndSendAs(customData.item, 'updateCustomdata');
            customData.multiplier = customData.MULTIPLIER;
        } else if (customData.multiplier > 0) {
            customData.multiplier--;
        };
        //get geolocation data (when requested)
        if (geoMultiplier == 0) {
            getAndSendAs("robotGeolocation", 'updateGeolocation');
            geoMultiplier = GEOMULTIPLIER;
        } else if (geoMultiplier > 0) {
            geoMultiplier--;
        };
    };
    //fire periodic timeout
    setTimeout(function() {
        periodicUpdate();
    }, INTERVALINCREMENT);

};
//setup customData requested item and requested interval
function customDataSetup(recievedCustomdata) {
    customData.item = recievedCustomdata.item;
    customData.updateInterval = recievedCustomdata.updateInterval;
    //round recieved multiplier to INTERVALINCREMENT
    customData.MULTIPLIER = Math.floor(customData.updateInterval / INTERVALINCREMENT);
    if (customData.MULTIPLIER == 0) {
        customData.MULTIPLIER = 1;
    } else if (customData.updateInterval % INTERVALINCREMENT >= INTERVALINCREMENT / 2) {
        customData.MULTIPLIER++;
    };
    customData.multiplier = customData.MULTIPLIER;
};
//fetch available scripts in userscripts/
function fetchScripts() {
    //reads files in userscripts dir and asynchronously calls updateScripts
    fs.readdir("userscripts/", updateScripts);
};
//parses files in userscripts/ for python/node scripts and sends list to front-end
function updateScripts(err, files) {
    var scripts = [];
    var j = 0;
    if (!!files) {
        for (var i = 0; i < files.length; i++) {
            if (files[i].indexOf(".py") > 0 || files[i].indexOf(".js") > 0) {
                scripts[j] = files[i];
                j++;
            };
        };
    };
    io.sendData('fetchedScripts', scripts);
};
//generate PNG map from binary matrix and send to front end
function buildMap(err, data) {
    var array = JSON.parse(data.map);
    var mapPNG = new PNG({
        width: MAPWIDTH,
        height: MAPHEIGHT,
    });
    for (var j = 0; j < mapPNG.height; j++) {
        for (var i = 0; i < mapPNG.width; i++) {
            var idx = (mapPNG.width * j + i) << 2;
            if (array[i][j] == 1 && !allwhite) {
                mapPNG.data[idx] = 0;
                mapPNG.data[idx + 1] = 0;
                mapPNG.data[idx + 2] = 0;
                mapPNG.data[idx + 3] = 255;
            } else {
                mapPNG.data[idx] = 255;
                mapPNG.data[idx + 1] = 255;
                mapPNG.data[idx + 2] = 255;
                mapPNG.data[idx + 3] = 255;
            }
        };
    };
    const mapStream = fs.createWriteStream('./public/images/map.png');
    mapStream.on('finish', function() {
        io.sendData('updateMap');
    });
    mapPNG.pack().pipe(mapStream);
    allwhite = !allwhite;
};
//update MongoDB with joystick coordinates    
function updateJoystick(joystickData) {
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
};
//perform actions based on selected controls in front end.
function updateControls(changedControlData) {
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
            break;
        case "dataMonitorCheckbox":
            dataMonitorOn = changedControlData.newValue;
            if (dataMonitorOn == false) {
                mapDataMultiplier = -1;
            };
            break;
    };
    //log changes
    process.stdout.write('HRUI: ' + changedControlData.changedControl.replace(/([a-z])([A-Z])/g, '$1 $2').replace('Checkbox', ''));
    if (changedControlData.newValue) {
        process.stdout.write('turned On\n');
    } else {
        process.stdout.write('turned Off\n');
    }

};
// update DB with custom input values
function updateCustomInput(customInput) {
    hruiDataDB.update({
        item: customInput.item
    }, {
        $set: customInput
    }, {
        upsert: true
    });
};
//get profiles from DB and fire event with data to front-end
function fetchProfiles() {
    getAndSendAs('profiles', 'fetchedProfiles');
};
//save new profile to DB
function saveProfile(profile) {
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
};
//stop periodic updates when clients are disconnected.
function setClientsAreConnected(newValue) {
    clientsAreConnected = newValue;
    if (newValue == false) {
        mapDataMultiplier = -1;
        geoMultiplier = -1;
        customData = {
            item: "",
            updateInterval: INTERVALINCREMENT,
            MULTIPLIER: -1,
            multiplier: -1,
        };
    };
};

function setMapMode(newMapMode) {
    if (newMapMode == 'server') {
        mapDataMultiplier = MAPDATAMULTIPLIER;
    } else {
        mapDataMultiplier = -1;
    }

};

//export methods to be accessed from other modules
module.exports = {
    updateJoystick: updateJoystick,
    updateControls: updateControls,
    updateCustomInput: updateCustomInput,
    fetchProfiles: fetchProfiles,
    saveProfile: saveProfile,
    periodicUpdate: periodicUpdate,
    customDataSetup: customDataSetup,
    fetchScripts: fetchScripts,
    setClientsAreConnected: setClientsAreConnected,
    setMapMode: setMapMode,
};

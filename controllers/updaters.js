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
const
    app = require('../app'),
    path = require('path'),
    fs = require("fs"),
    busboy = require('connect-busboy'),
    io = require('./websockets/io'),
    scriptCtrl = require('./scriptController'),
    AVCONV = app.PARAMS.AVCONV,
    PNG = require('pngjs').PNG,
    hruiDataDB = app.PARAMS.HRUIDATADB,
    INTERVALINCREMENT = 50,
    GEOMULTIPLIER = 20,
    MAPDATAMULTIPLIER = 5,
    MAPWIDTH = 300,
    MAPHEIGHT = 300;
var
    geoMultiplier = -1,
    mapDataMultiplier = -1,
    dataMonitorOn = false,
    clientsAreConnected = false,
    binMatrix = new Array(MAPWIDTH),
    customData = {
        item: "",
        updateInterval: INTERVALINCREMENT,
        MULTIPLIER: -1,
        multiplier: -1,
    };
for (var i = 0; i < binMatrix.length; i++) {
    binMatrix[i] = new Array(MAPHEIGHT);
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
        console.log("HRUI: Uploading " + filename + ' to public/images/uploadmap');
        fstream = fs.createWriteStream(__dirname + '/../public/images/uploadmap');
        file.pipe(fstream);
        fstream.on('close', function() {
            res.send('Uploaded');
            console.log("HRUI: Uploaded " + filename + ' succesfully');
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
                    if (!!data) {
                        buildMap(data);
                    } else {
                        console.log("HRUI Error: Could not retrieve map data from DB." +
                            " Check that item = mapData, and binary matrix is stored in \"map\" property");
                    };
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
function buildMap(data) {
    binMatrix = JSON.parse(data.map);
    if (binMatrix.length == MAPHEIGHT && binMatrix[binMatrix.length - 1].length == MAPWIDTH) {
        var mapPNG = new PNG({
            width: MAPWIDTH,
            height: MAPHEIGHT,
        });
        for (var j = 0; j < mapPNG.height; j++) {
            for (var i = 0; i < mapPNG.width; i++) {
                var idx = (mapPNG.width * j + i) << 2;
                if (binMatrix[i][j] != 0) {
                    mapPNG.data[idx] = 0;
                    mapPNG.data[idx + 1] = 0;
                    mapPNG.data[idx + 2] = 0;
                } else {
                    mapPNG.data[idx] = 255;
                    mapPNG.data[idx + 1] = 255;
                    mapPNG.data[idx + 2] = 255;
                }
                mapPNG.data[idx + 3] = 255;
            };
        };
        const mapStream = fs.createWriteStream('./public/images/map.png');
        mapStream.on('finish', function() {
            io.sendData('updateMap');
        });
        mapPNG.pack().pipe(mapStream);
    } else
        console.log('HRUI Error: Map Data must be 300x300 matrix, where 0 is white and any other value is black');
};

function updateMapDrawing(mapDataUri) {
    mapDataUri = mapDataUri.replace(/^data:image\/png;base64,/, "");
    fs.writeFile("./public/images/map.png", mapDataUri, 'base64', function(err) {
        if (err) {
            throw err;
        };
        fs.createReadStream('./public/images/map.png')
            .pipe(new PNG({
                filterType: -1
            }))
            .on('parsed', function() {
                for (var j = 0; j < this.height; j++) {
                    for (var i = 0; i < this.width; i++) {
                        var idx = (this.width * j + i) << 2;
                        //check for black pixel
                        if (this.data[idx] == 0 && this.data[idx + 1] == 0 && this.data[idx + 2] == 0) {
                            binMatrix[i][j] = 1;
                        } else {
                            binMatrix[i][j] = 0;
                        }
                    }
                }
            });
        hruiDataDB.update({
            item: "mapData"
        }, {
            $set: {
                map: JSON.stringify(binMatrix),
            }
        }, {
            upsert: true
        });
    });
};
//update MongoDB with joystick coordinates    
function updateJoystick(joystickData) {
    hruiDataDB.update({
        item: joystickData.joystickItem
    }, {
        $set: {
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
    process.stdout.write('HRUI IO: ' + changedControlData.changedControl.replace(/([a-z])([A-Z])/g, '$1 $2').replace('Checkbox', ''));
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
    console.log('HRUI IO: Saving Profile ' + profile.name);
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
//update MongoDB with device orientation data
function updateDeviceOrientation(deviceData) {
    hruiDataDB.update({
        item: "deviceData"
    }, {
        $set: deviceData,
    }, {
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
//start generating map when front end 'server' map mode enabled.
function setMapMode(newMapMode) {
    if (newMapMode == 'server') {
        mapDataMultiplier = MAPDATAMULTIPLIER;
    } else {
        mapDataMultiplier = -1;
    }

};

function updateVoiceCommand(command) {
    hruiDataDB.update({
        item: "voiceCommand"
    }, {
        $set: {
            command: command.command,
            value: command.value,
        }
    }, {
        upsert: true
    });
};
//save audio as command.wav for use by other programs
function saveAudioFile(audio) {
    var audioFile = audio.replace(/^data:audio\/wav;base64,/, "");
    fs.writeFile("public/command.wav", audioFile, 'base64', function(err) {
        if (err) throw err;
    });
};

function updateGamepad(gamepad) {    
    hruiDataDB.update({
        item: "gamepad"
    }, {
        $set: {
            axes: gamepad.axes,
            buttons: gamepad.buttons,
        }
    }, {
        upsert: true
    });
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
    updateDeviceOrientation: updateDeviceOrientation,
    setClientsAreConnected: setClientsAreConnected,
    setMapMode: setMapMode,
    updateMapDrawing: updateMapDrawing,
    updateVoiceCommand: updateVoiceCommand,
    saveAudioFile: saveAudioFile,
    updateGamepad: updateGamepad,
};

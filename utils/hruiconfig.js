#!/usr/bin/env node

/*
    HTML5 Robot User Interface Server
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

//  HRUI MongoDB init script. Run: mongo path/to/hruiconfig.js to setup the database.
//  You may add/remove/modify as many other entries as you like.

//  get database, drop it (resetting it), open it again and create collection
db = db.getSiblingDB('hrui');
db.dropDatabase();
db = db.getSiblingDB('hrui');
db.createCollection('data');


//  joystick (can be removed, front-end automatically generates entry. Kept for reference)
db.data.insert({
    "_id": 0,
    "item": "joystick",
    "x": "0.00",
    "y": "0.00",
    "mode": "lock4ways"
});
//  robotData (required for Data Monitor Module)
db.data.insert({
    "_id": 1,
    "item": "robotData",
    "position": {
        "x": 0.00,
        "y": 0.00,
        "z": 0.00
    },
    "orientation": {
        "alpha": 0.00,
        "beta": 0.00,
        "gamma": 0.00
    },
    "speed": {
        "vx": 0.00,
        "vy": 0.00,
        "vz": 0.00
    },
    "angularSpeed": {
        "dGamma": 0.00,
        "dAlpha": 0.00,
        "dBeta": 0.00
    }
});
//  robotGeolocation (required for Geolocation Module)
db.data.insert({
    "_id": 2,
    "item": "robotGeolocation",
    "latitude": 40.496534,
    "longitude": -3.877457,
    "accuracyRadiusInMeters": "5"
});
//  customDataTest (used to test custom data retrieval. can be removed.)
db.data.insert({
    "_id": 3,
    "item": "customDataTest",
    "if": "you see this,",
    "customData": "is",
    "working": ":)"
});
//  profiles (can be removed, will be inserted automatically. Kept for reference.)
db.data.insert({
    "_id": 4,
    "item": "profiles",
    //saved profiles will appear here, with their name as key.
});
//  mapData. used to generate a map from a 300x300 binary matrix, where 0 is white (clear) and 
//  any other value is black (obstacle). This map is dumped in a PNG image, loaded by the front-end when
//  data monitor map is on and in 'server' mode. If removed or if size not 300x300, 'server' map mode
//  will not work, and may make map module unstable if selected (unlikely, but possible).

//  generate 0 (white) filled 300x300 matrix
const MAPWIDTH = 300;
const MAPHEIGHT = 300;
var binMatrix = new Array(MAPWIDTH);
var zeroes = new Array(MAPHEIGHT);
for (var i = 0; i < MAPHEIGHT; i++) zeroes[i] = 0;
for (var i = 0; i < binMatrix.length; i++) binMatrix[i] = zeroes;
//  insert mapData entry
db.data.insert({
    "_id": 5,
    "item": "mapData",
    "map": JSON.stringify(binMatrix),
});
//  deviceData item, for devices with motion and orientation
//  (can be removed, will be inserted automatically when needed. Kept for reference)
db.data.insert({
    "_id": 6,
    "item": "deviceData",
    "deviceMotion": {
        "rotationRate": {
            "alpha": 0,
            "beta": 0,
            "gamma": 0,
        },
        "acceleration": {
            "x": 0,
            "y": 0,
            "z": 0,
        }
    },
    "deviceOrientation": {
        "absolute": null,
        "alpha": 0,
        "beta": 0,
        "gamma": 0,
    }
});

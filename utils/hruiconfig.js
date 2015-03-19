//HRUI MongoDB init script. Run: mongo path/to/hruiconfig.js to setup the database.
//You may add/remove as many other entries as you like.

//get database, drop it, open it again and create collection
db = db.getSiblingDB('hrui');
db.dropDatabase();
db = db.getSiblingDB('hrui');
db.createCollection('data');


//joystick (can be removed, front-end automatically generates entry, kept for reference)
db.data.insert({
    "_id": 0,
    "item": "joystick",
    "x": "0.00",
    "y": "0.00",
    "mode": "lock4ways"
});
//robotData (required for Data Monitor Module)
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

//robotGeolocation (required for Geolocation Module)
db.data.insert({
    "_id": 2,
    "item": "robotGeolocation",
    "latitude": 40.496534,
    "longitude": -3.877457,
    "accuracyRadiusInMeters": "5"
});
//customDataTest (used to test custom data retrieval. can be removed.)
db.data.insert({
    "_id": 3,
    "item": "customDataTest",
    "if": "you see this,",
    "customData": "is",
    "working": ":)"
});

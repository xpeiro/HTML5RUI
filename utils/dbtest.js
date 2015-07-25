/*
    HTML5 Robot User Interface Server
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

//HRUI Database Test Utility

/*
Usage: node test.js [item] [optional:refresh interval]
 item: the item to pull from the database.
 refresh interval: poll time in ms. If none given, polls once.
*/

const
    monk = require('monk'),
    DB = monk('localhost:27017/hrui'),
    hrui = DB.get('data');

function getHRUI(item) {
    hrui.findOne({
        "item": item
    }, function(err, data) {
        if (!!data) {
            console.log(data);
        } else {
            console.log('Error polling for item: ' + item + '.');
            process.exit(1);
        };
    });

};

function loop(item, interval) {
    setInterval(function() {
        process.stdout.write('\033c');
        getHRUI(item);
    }, interval);
}

if (process.argv.length < 3) {
    console.log('No arguments given.\nUsage: node test.js [item] [optional:refresh interval]\n',
        'item: the item to pull from the database.\n',
        'refresh interval: poll time in ms. If none given, polls once.');
    process.exit(0);
} else if (process.argv.length < 4) {
    console.log('No poll time given. Polling Once.');
    getHRUI(process.argv[2]);
    setTimeout(function() {
        process.exit(0);
    }, 1000);
} else {
    if (!isNaN(process.argv[3])) {
        console.log('Waiting for first poll timeout');
        loop(process.argv[2], process.argv[3]);
    } else {
        console.log('Second argument is not a number.\nUsage: node test.js [item] [optional:refresh interval]\n',
            'item: the item to pull from the database.\n',
            'refresh interval: poll time in ms. If none given, polls once.');
        process.exit(1);
    }

}

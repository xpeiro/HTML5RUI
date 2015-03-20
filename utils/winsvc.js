/*
    HTML5 Robot User Interface Server
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

var Service = require('node-windows').Service;
var action = process.argv[2];
var servicename = process.argv[3];
// Create a new service object with default name and description
var svc = new Service({
	name: 'NodeService',
	description: 'NodeJS Service',
	script: __dirname + '\\..\\app.js'
});

if (!!servicename) {
	svc.name = servicename;
};

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function() {
	svc.start();
});

switch (action) {
	case 'install':
		console.log("Installing " + svc.script + " as service: " + svc.name);
		a = svc.install();
		break;
	case 'uninstall':
		console.log("Uninstalling service: " + svc.name);
		svc.uninstall();
		break;
	case 'start':
		console.log("Starting service: " + svc.name);
		svc.start();
		break;
	case 'stop':
		console.log("Stopping service: " + svc.name);
		svc.stop();
		break;
	default:
		console.log("args: install/uninstall/start/stop");
}
/*
    HTML5 Robot User Interface Web Application
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

//app init
var app = angular.module('HRUI', ['ngSanitize', 'ngAnimate', 'angularFileUpload']);
//set color constants
var BACKGROUND_COLOR = "#CCCCCC";
var FOREGROUND_COLOR = "#A8AAAA";
//main app controller. manages active modules, profiles and notifies back-end of change in controls when necessary.
app.controller('HRUIController', ['$rootScope', '$scope', 'SocketSrv', 'ProfileSrv',
    function(rootScope, scope, SocketSrv, ProfileSrv) {
        scope.classes = "";
        scope.menuOn = !window.matchMedia("(max-width: 480px)").matches;
        scope.joystickOn = false;
        scope.dualJoystickOn = false;
        scope.devOrientOn = false;
        scope.voiceCommOn = false;
        scope.dataMonitorOn = false;
        scope.liveVideoOn = false;
        scope.liveAudioOn = false;
        scope.geolocationOn = false;
        scope.customDataOn = false;
        scope.customInputOn = false;
        scope.scriptExecOn = false;
        scope.gamepadOn = false;
        scope.selectedProfile = {};
        scope.profileName = "";
        scope.profiles = {};
        scope.saveProfileClicked = false;
        //Receive Initial Parameters
        SocketSrv.socket.on('initParams', function(params) {
            SocketSrv.VIDEOWSPORT = params.VIDEOWSPORT;
            SocketSrv.AUDIOWSPORT = params.AUDIOWSPORT;
            SocketSrv.VIDEODEVICE = params.VIDEODEVICE;
        });
        //initial profile fetch
        setTimeout(function() {
            SocketSrv.socket.emit('fetchProfiles');
        }, 500);

        //populate profiles array on profile list reception
        SocketSrv.socket.on('fetchedProfiles', function(profiles) {
            if (!!profiles) {
                delete profiles._id;
                delete profiles.item;
                scope.profiles = profiles;
            };
            scope.$digest();
        });
        //share profile data to profile service (to send it to backend)
        scope.$on('getProfile', function() {
            ProfileSrv.profile.menuOn = scope.menuOn;
            ProfileSrv.profile.joystickOn = scope.joystickOn;
            ProfileSrv.profile.dualJoystickOn = scope.dualJoystickOn;
            ProfileSrv.profile.dataMonitorOn = scope.dataMonitorOn;
            ProfileSrv.profile.liveVideoOn = scope.liveVideoOn;
            ProfileSrv.profile.geolocationOn = scope.geolocationOn;
            ProfileSrv.profile.customDataOn = scope.customDataOn;
            ProfileSrv.profile.customInputOn = scope.customInputOn;
            ProfileSrv.profile.scriptExecOn = scope.scriptExecOn;
            ProfileSrv.profile.liveAudioOn = scope.liveAudioOn;
            ProfileSrv.profile.devOrientOn = scope.devOrientOn;
            ProfileSrv.profile.voiceCommOn = scope.voiceCommOn;
            ProfileSrv.profile.gamepadOn = scope.gamepadOn;
        });
        //save current profile and send it to backend
        scope.saveProfile = function() {
            //hide save profile textbox
            scope.saveProfileClicked = false;
            //name current profil
            ProfileSrv.profile.name = scope.profileName;
            //notify all controllers to share profile data to ProfileSrv
            rootScope.$broadcast('getProfile');
            //send current profile to backend
            SocketSrv.socket.emit('saveProfile', ProfileSrv.profile);
            //fetch new list of profiles
            setTimeout(function() {
                SocketSrv.socket.emit('fetchProfiles');
            }, 200);
        };
        //load selected profile
        scope.profileSelected = function() {
            //share selected profile to profile service
            ProfileSrv.profile = scope.selectedProfile;
            //load selected profile 
            scope.menuOn = scope.selectedProfile.menuOn;
            scope.joystickOn = scope.selectedProfile.joystickOn;
            scope.dualJoystickOn = scope.selectedProfile.dualJoystickOn;
            scope.dataMonitorOn = scope.selectedProfile.dataMonitorOn;
            scope.geolocationOn = scope.selectedProfile.geolocationOn;
            scope.customDataOn = scope.selectedProfile.customDataOn;
            scope.customInputOn = scope.selectedProfile.customInputOn;
            scope.scriptExecOn = scope.selectedProfile.scriptExecOn;
            scope.devOrientOn = scope.selectedProfile.devOrientOn;
            scope.voiceCommOn = scope.selectedProfile.voiceCommOn;
            scope.gamepadOn = scope.selectedProfile.gamepadOn;
            //notify backend of new selected controls (only required for video/audio/location/map)
            if (scope.liveVideoOn != scope.selectedProfile.liveVideoOn) {
                scope.liveVideoOn = scope.selectedProfile.liveVideoOn;
                scope.sendControl('liveVideoCheckbox', scope.liveVideoOn);
            };
            if (scope.liveAudioOn != scope.selectedProfile.liveAudioOn) {
                scope.liveAudioOn = scope.selectedProfile.liveAudioOn;
                scope.sendControl('liveAudioCheckbox', scope.liveAudioOn);
            };
            scope.sendControl('geolocationCheckbox', scope.geolocationOn);
            scope.sendControl('dataMonitorCheckbox', scope.dataMonitorOn);
            //notify backend of new map mode if data monitor on
            if (scope.dataMonitorOn) {
                SocketSrv.socket.emit('setMapMode', ProfileSrv.profile.mapMode);
            };
            //notify all controllers to set selected profile from service (delay to allow script loading)
            requestAnimationFrame(function() {
                rootScope.$broadcast('setProfile');
                //trigger visual refresh (digest new scope values)
                rootScope.$digest();
            });


        };
        //extract updated control from event, and notify back-end of selected controls
        scope.updateControls = function(control, newValue) {
            var changedControl = control.target.attributes.id.value;
            scope.sendControl(changedControl, newValue);
        };
        //notify back-end of selected controls
        scope.sendControl = function(changedControl, newValue) {
            SocketSrv.socket.emit('updateControls', {
                changedControl: changedControl,
                newValue: newValue,
            });
        };
    },
]);

//directive to override default touch controls on canvas and link touch events to handler functions
app.directive('touch', function() {
    return {
        link: function(scope, element, attrs) {
            element.on('touchmove', function(event) {
                scope.touchMove(event);
            });
            element.on('touchdown mousedown', function(event) {
                scope.mouseDown(event);
            });
            element.on('mousemove', function(event) {
                scope.mouseMove(event);
            });
            element.on('mouseup touchend', function(event) {
                scope.mouseUp(event);
            });
            var mouseout = false;
            element.on('mouseout', function(event) {
                mouseout = true;
            });
            document.onmouseup = function(event) {
                if (mouseout) {
                    mouseout = false;
                    scope.mouseUp(event);
                }
            };
        }
    }
});

//string filter. Returns 'On' if given boolean is true, 'Off' otherwise.
app.filter('OnOff', function() {
    return function(bool) {
        return bool ? 'ON' : 'OFF';
    }
});

/* 
   requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
   Used under MIT license
*/
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

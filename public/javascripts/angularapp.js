var app = angular.module('HRUI', ['ngSanitize']);
//set color constants
var BACKGROUND_COLOR = "#8BA987";
var FOREGROUND_COLOR = "grey";
//directive to override default touch controls on joystick and link touch events to handler functions
app.directive('touch', function() {
    return {
        link: function(scope, element, attrs) {
            element.on('touchmove', function(event) {
                scope.touchMove(event);
                scope.$apply();
            });
            element.on('touchdown mousedown', function(event) {
                scope.mouseDown(event);
                scope.$apply();
            });
            element.on('mousemove', function(event) {
                scope.mouseMove(event);
                scope.$apply();
            });
            element.on('mouseup touchend', function(event) {
                scope.mouseUp(event);
                scope.$apply();
            });
        }
    }
});
//main app controller. manages active modules, profiles and notifies back-end of change in controls when necessary.
app.controller('HRUIController', ['$rootScope', '$scope', 'SocketSrv', 'ProfileSrv',
    function(rootScope, scope, SocketSrv, ProfileSrv) {
        scope.joystickOn = false;
        scope.dataMonitorOn = false;
        scope.liveVideoOn = false;
        scope.geolocationOn = false;
        scope.customDataOn = false;
        scope.customInputOn = false;
        scope.scriptExecOn = false;
        scope.selectedProfile = {};
        scope.profileName = "";
        scope.profiles = {};
        scope.saveProfileClicked = false;
        setTimeout(function() {
            SocketSrv.socket.emit('fetchProfiles');            
        }, 500);
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
            }, 500);
        };
        //share profile data to profile service (to send it to backend)
        scope.$on('getProfile', function() {
            ProfileSrv.profile.joystickOn = scope.joystickOn;
            ProfileSrv.profile.dataMonitorOn = scope.dataMonitorOn;
            ProfileSrv.profile.liveVideoOn = scope.liveVideoOn;
            ProfileSrv.profile.geolocationOn = scope.geolocationOn;
            ProfileSrv.profile.customDataOn = scope.customDataOn;
            ProfileSrv.profile.customInputOn = scope.customInputOn;
            ProfileSrv.profile.scriptExecOn = scope.scriptExecOn;
        });
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
            //if live video is turned off, close the websocket
            if (changedControl == "liveVideoCheckbox" && newValue == false) {
                SocketSrv.wsocket.close();
            };
        };
        //load selected profile
        scope.profileSelected = function() {
            //share selected profile to profile service
            ProfileSrv.profile = scope.selectedProfile;
            //load selected profile 
            scope.joystickOn = scope.selectedProfile.joystickOn;
            scope.dataMonitorOn = scope.selectedProfile.dataMonitorOn;
            scope.geolocationOn = scope.selectedProfile.geolocationOn;
            scope.customDataOn = scope.selectedProfile.customDataOn;
            scope.customInputOn = scope.selectedProfile.customInputOn;
            scope.scriptExecOn = scope.selectedProfile.scriptExecOn;
            //notify backend of new selected controls (only required for video and location)
            if (scope.liveVideoOn != scope.selectedProfile.liveVideoOn) {
                scope.liveVideoOn = scope.selectedProfile.liveVideoOn;
                scope.sendControl('liveVideoCheckbox', scope.liveVideoOn);
            };
            scope.sendControl('geolocationCheckbox', scope.geolocationOn);
            //notify all controllers to set selected profile from service (delay to allow script loading)
            setTimeout(function() {
                rootScope.$broadcast('setProfile');
            }, 1);            
        };
        //populate profiles array on profile list reception
        SocketSrv.socket.on('fetchedProfiles', function(profiles) {
            if (!!profiles) {
                delete profiles._id;
                delete profiles.item;
                scope.profiles = profiles;
            };
            scope.$apply();
        });
    }
]);
//string filter. Returns 'On' if given boolean is true, 'Off' otherwise.
app.filter('OnOff', function() {
    return function(bool) {
        return bool ? 'On' : 'Off';
    }
});

/*
    HTML5 Robot User Interface Web Application
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

//app init
var app = angular.module('HRUI', ['ngSanitize']);
//set color constants
var BACKGROUND_COLOR = "#8BA987";
var FOREGROUND_COLOR = "grey";
//main app controller. manages active modules, profiles and notifies back-end of change in controls when necessary.
app.controller('HRUIController', ['$rootScope', '$scope', 'SocketSrv', 'ProfileSrv',
    function(rootScope, scope, SocketSrv, ProfileSrv) {
        scope.joystickOn = false;
        scope.dataMonitorOn = false;
        scope.liveVideoOn = false;
        scope.liveAudioOn = false;
        scope.geolocationOn = false;
        scope.customDataOn = false;
        scope.customInputOn = false;
        scope.scriptExecOn = false;
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
            scope.$apply();
        });
        //share profile data to profile service (to send it to backend)
        scope.$on('getProfile', function() {
            ProfileSrv.profile.joystickOn = scope.joystickOn;
            ProfileSrv.profile.dataMonitorOn = scope.dataMonitorOn;
            ProfileSrv.profile.liveVideoOn = scope.liveVideoOn;
            ProfileSrv.profile.geolocationOn = scope.geolocationOn;
            ProfileSrv.profile.customDataOn = scope.customDataOn;
            ProfileSrv.profile.customInputOn = scope.customInputOn;
            ProfileSrv.profile.scriptExecOn = scope.scriptExecOn;
            ProfileSrv.profile.liveAudioOn = scope.liveAudioOn;
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
            }, 500);
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
            //if live video is turned off, close the websocket
            if (changedControl == "liveVideoCheckbox" && newValue == false) {
                SocketSrv.videowsocket.close();
            } else if (changedControl == "liveAudioCheckbox" && newValue == false) {
                SocketSrv.wsPlayer.stop();
                SocketSrv.wsPlayer.asset.source.socket.close();                
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
            //notify backend of new selected controls (only required for video/audio and location)
            if (scope.liveVideoOn != scope.selectedProfile.liveVideoOn) {
                scope.liveVideoOn = scope.selectedProfile.liveVideoOn;
                scope.sendControl('liveVideoCheckbox', scope.liveVideoOn);
            };
            if (scope.liveAudioOn != scope.selectedProfile.liveAudioOn) {
                scope.liveAudioOn = scope.selectedProfile.liveAudioOn;
                scope.sendControl('liveAudioCheckbox', scope.liveAudioOn);
            };
            scope.sendControl('geolocationCheckbox', scope.geolocationOn);
            //notify all controllers to set selected profile from service (delay to allow script loading)
            setTimeout(function() {
                rootScope.$broadcast('setProfile');
            }, 1);
            //trigger visual refresh (digest new scope values)
            setTimeout(function() {
                rootScope.$apply();
            }, 1);

        };
    }
]);

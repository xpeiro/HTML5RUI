/*
    HTML5 Robot User Interface Web Application
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/
/*
    Device Orientation Controller.
    Based on: http://www.html5rocks.com/en/tutorials/device/orientation/
    by Pete LePage http://www.html5rocks.com/profiles/#petele
*/
app.controller('DeviceOrientationController', ['$scope', '$element', '$window', 'SocketSrv', 'ProfileSrv',
    function(scope, element, $window, SocketSrv, ProfileSrv) {
        var updateReq,
            n = 30;
        scope.devOrientationUnsupported = false;
        scope.devMotionUnsupported = false;
        scope.deviceData = {
            devOrientation: {
                absolute: null,
                alpha: null,
                beta: null,
                gamma: null,
            },
            devMotion: {
                rotationRate: {
                    alpha: null,
                    beta: null,
                    gamma: null,
                },
                acceleration: {
                    x: null,
                    y: null,
                    z: null,
                },
            },
        };
        scope.selectedValues = {
            devOrientation: {
                absolute: true,
                alpha: true,
                beta: true,
                gamma: true,
            },
            devMotion: {
                rotationRate: {
                    alpha: true,
                    beta: true,
                    gamma: true,
                },
                acceleration: {
                    x: true,
                    y: true,
                    z: true,
                },
            },
        };
        //share profile data with ProfileSrv
        scope.$on('getProfile', function() {
            ProfileSrv.profile.selectedValues = scope.selectedValues;
        });
        //load profile from ProfileSrv
        scope.$on('setProfile', function() {
            scope.selectedValues = ProfileSrv.profile.selectedValues;
        });
        scope.$on('$destroy', function() {
            cancelAnimationFrame(updateReq);
        });

        configureEvents();

        function updateLoop() {
            updateReq = requestAnimationFrame(updateLoop);
            SocketSrv.socket.emit('updateDeviceOrientation', scope.deviceData);
            if (n == 0) {
                scope.$digest();
                n = 30;
            } else {
                n--;
            }
        };

        function configureEvents() {
            //check for browser support, add listener if supported.
            if ($window.DeviceOrientationEvent) {
                angular.element($window).on('deviceorientation', function(eventData) {
                    //if reference is earth, then true.
                    scope.deviceData.devOrientation.absolute = eventData.absolute;
                    // gamma is the left-to-right tilt in degrees, where right is positive
                    if (scope.selectedValues.devOrientation.gamma) {
                        scope.deviceData.devOrientation.gamma = eventData.gamma;
                    };
                    // beta is the front-to-back tilt in degrees, where front is positive
                    if (scope.selectedValues.devOrientation.beta) {
                        scope.deviceData.devOrientation.beta = eventData.beta;
                    };
                    // alpha is the compass direction the device is facing in degrees
                    if (scope.selectedValues.devOrientation.alpha) {
                        scope.deviceData.devOrientation.alpha = eventData.alpha;
                    };
                });
            } else {
                scope.devOrientationUnsupported = true;
            };
            //check for browser support, add listener if supported.
            if ($window.DeviceMotionEvent) {
                angular.element($window).on('devicemotion', function(eventData) {
                    if (!!eventData.rotationRate) {
                        if (scope.selectedValues.devMotion.rotationRate.gamma) {
                            scope.deviceData.devMotion.rotationRate.gamma = eventData.rotationRate.gamma;
                        };
                        if (scope.selectedValues.devMotion.rotationRate.beta) {
                            scope.deviceData.devMotion.rotationRate.beta = eventData.rotationRate.beta;
                        };
                        if (scope.selectedValues.devMotion.rotationRate.alpha) {
                            scope.deviceData.devMotion.rotationRate.alpha = eventData.rotationRate.alpha;
                        };
                    };
                    if (!!eventData.acceleration) {
                        if (scope.selectedValues.devMotion.acceleration.x) {
                            scope.deviceData.devMotion.acceleration.x = eventData.acceleration.x;
                        };
                        if (scope.selectedValues.devMotion.acceleration.y) {
                            scope.deviceData.devMotion.acceleration.y = eventData.acceleration.y;
                        };
                        if (scope.selectedValues.devMotion.acceleration.z) {
                            scope.deviceData.devMotion.acceleration.z = eventData.acceleration.z;
                        };
                    };
                });
            } else {
                scope.devMotionUnsupported = true;
            };
            requestAnimationFrame(updateLoop);
        };
    },
]);

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
app.controller('DeviceOrientationController', ['$scope', '$window', 'SocketSrv',
    function(scope, $window, SocketSrv) {
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
        //check for browser support, add listener if supported.
        if ($window.DeviceOrientationEvent) {
            angular.element($window).on('deviceorientation', function(eventData) {
                //if reference is earth, then true.
                scope.deviceData.devOrientation.absolute = eventData.absolute;
                // gamma is the left-to-right tilt in degrees, where right is positive
                scope.deviceData.devOrientation.gamma = eventData.gamma;
                // beta is the front-to-back tilt in degrees, where front is positive
                scope.deviceData.devOrientation.beta = eventData.beta;
                // alpha is the compass direction the device is facing in degrees
                scope.deviceData.devOrientation.alpha = eventData.alpha;
                scope.$apply();
                SocketSrv.socket.emit('updateDeviceOrientation', scope.deviceData);
            });
        } else {
            scope.devOrientationUnsupported = true;
            scope.$apply();
        };
        //check for browser support, add listener if supported.
        if ($window.DeviceMotionEvent) {
            angular.element($window).on('devicemotion', function(eventData) {
                if (!!eventData.rotationRate) {
                    scope.deviceData.devMotion.rotationRate.gamma = eventData.rotationRate.gamma;
                    scope.deviceData.devMotion.rotationRate.beta = eventData.rotationRate.beta;
                    scope.deviceData.devMotion.rotationRate.alpha = eventData.rotationRate.alpha;
                };
                if (!!eventData.acceleration) {
                    scope.deviceData.devMotion.acceleration.x = eventData.acceleration.x;
                    scope.deviceData.devMotion.acceleration.y = eventData.acceleration.y;
                    scope.deviceData.devMotion.acceleration.z = eventData.acceleration.z;
                };
                scope.$apply();
                SocketSrv.socket.emit('updateDeviceOrientation', scope.deviceData);
            });
        } else {
            scope.devMotionUnsupported = true;
            scope.$apply();
        };
    },
]);

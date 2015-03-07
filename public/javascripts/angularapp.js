var app = angular.module('HRUI', ['ngSanitize']);
//set color constants
var BACKGROUND_COLOR = "#8598C4";
var FOREGROUND_COLOR = "#39538D";
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
//main app controller. manages active modules and notifies back-end of change in controls when necessary.
app.controller('HRUIController', ['$scope', 'SocketSrv',
    function(scope, SocketSrv) {
        scope.joystickOn = true;
        scope.dataMonitorOn = true;
        scope.liveVideoOn = false;
        scope.geolocationOn = false;
        scope.customDataOn = false;
        scope.customInputOn = false;
        scope.updateControls = function(control, newValue) {
            var changedControl = control.target.attributes.id.value;
            SocketSrv.socket.emit('updateControls', {
                changedControl: changedControl,
                newValue: newValue,
            });
            if (changedControl == "liveVideoCheckbox" && newValue == false) {
                SocketSrv.wsocket.close();
            };
        }
        scope.optionsClick = function  () {
            
        }
    }
]);
//string filter. Returns 'On' if given boolean is true, 'Off' otherwise.
app.filter('OnOff', function() {
    return function(bool) {
        return bool ? 'On' : 'Off';
    }
});

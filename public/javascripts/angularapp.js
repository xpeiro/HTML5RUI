var app = angular.module('HRUI', ['ngSanitize']);
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
    function($scope, SocketSrv) {
        $scope.joystickOn = true;
        $scope.dataMonitorOn = true;
        $scope.liveVideoOn = false;
        $scope.geolocationOn = false;
        $scope.customDataOn = false;
        $scope.updateControls = function(control) {
            var changedControl = control.target.attributes.id.value;
            switch (changedControl) {
                case "liveVideoCheckbox":
                    SocketSrv.socket.emit('updateControls', {
                        changedControl: changedControl,
                        newValue: $scope.liveVideoOn
                    });
                    if (!$scope.liveVideoOn) {
                        SocketSrv.wsocket.close();
                    };
                    break;
            }
        }
    }
]);
//string filter. Returns 'On' if given boolean is true, 'Off' otherwise.
app.filter('OnOff', function() {
    return function(bool) {
        return bool ? 'On' : 'Off';
    }
});
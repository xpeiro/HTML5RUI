var app = angular.module('HRUI', []);
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
app.service('GeneralSrv', function() {
    //open WebSocket
    this.socket = io.connect();
    this.wsocket;
});
app.filter('OnOff', function() {
    return function(bool) {
        return bool ? 'On' : 'Off';
    }
});
app.controller('HRUIController', ['$scope', 'GeneralSrv',
    function($scope, GeneralSrv) {
        $scope.joystickOn = true;
        $scope.dataMonitorOn = true;
        $scope.liveVideoOn = false;
        $scope.geolocationOn = false;
        $scope.updateControls = function(control) {            
            var changedControl = control.target.attributes.id.value;
            switch (changedControl) {
                case "liveVideoCheckbox":                    
                    GeneralSrv.socket.emit('updateControls', { changedControl: changedControl, newValue: !$scope.liveVideoOn});
                    if ($scope.liveVideoOn) {
                        GeneralSrv.wsocket.close();
                    };
                    break;
            }
        }
    }
]);
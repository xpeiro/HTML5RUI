var app = angular.module('HRUI', []);
app.directive('touch', function() {
    return {
        link: function(scope, element, attrs) {
            element.on('touchmove', function(event) {
                touchMove(event);
            });
            element.on('touchdown mousedown', function(event) {
                mouseDown(event);
            });
            element.on('mousemove', function(event) {
                mouseMove(event);
            });
            element.on('mouseup touchend', function(event) {
                mouseUp(event);
            });
        }
    }
});
app.service('GeneralSrv', function() {
    //open WebSocket
    this.socket = io.connect();

    function toggle(bool) {
        bool = !bool;
    }
});
app.controller('HRUIController', ['$scope', 'GeneralSrv',
    function($scope) {
        $scope.joystickOn = true;
    }
]);
app.filter('OnOff', function() {
    return function(bool) {
        return bool ? 'On' : 'Off';
    }
});
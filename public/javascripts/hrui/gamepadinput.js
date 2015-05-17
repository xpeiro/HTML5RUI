/*
    HTML5 Robot User Interface Web Application
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

/*
Gamepad Controller
*/

/***EXPERIMENTAL FEATURE***/
app.controller('GamepadController', ['$scope', 'SocketSrv',
    function(scope, SocketSrv) {
        var updateReq;
        var gamepad;
        scope.connected = false;
        //if not firefox, start immediately
        if (!!getGamepad()) {
            scope.connected = true;
            updateReq = requestAnimationFrame(updateLoop);
        };
        //if firefox, start on connection event
        window.addEventListener("gamepadconnected", listener);
        window.addEventListener("gamepaddisconnected", function() {
            scope.connected = false;
            scope.$apply();
        });
        scope.$on('$destroy', function() {
            window.removeEventListener("gamepadconnected", listener);
            cancelAnimationFrame(updateReq);
        });

        function listener() {
            scope.connected = true;
            scope.$apply();
            updateReq = requestAnimationFrame(updateLoop);
        };

        function updateLoop() {            
            gamepad = getGamepad();
            if (gamepad) {
                var buttons = [];
                for (var i = 0; i < gamepad.buttons.length; i++) {
                    buttons.push(gamepad.buttons[i].value);
                };
                SocketSrv.socket.emit('gamepadUpdate', {
                    axes: gamepad.axes,
                    buttons: buttons,
                });
                updateReq = requestAnimationFrame(updateLoop);
            };
        };

        function getGamepad() {
            var gamepads = navigator.getGamepads ? navigator.getGamepads() :
                (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
            return gamepads[0];
        };

    },
]);

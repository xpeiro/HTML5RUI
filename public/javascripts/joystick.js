app.controller('JoystickController', ['$scope', 'SocketSrv', 'DrawSrv', 'GeometrySrv',
    function(scope, SocketSrv, DrawSrv, GeometrySrv) {
        scope.lockJoystick = false;
        scope.lockMode = 'lock4ways';
        scope.showVector = true;
        scope.point = {
            x: 0,
            y: 0,
        };
        var joystick = document.getElementById('joystick');
        var joystickctx = joystick.getContext('2d');
        var vector = document.getElementById('vector');
        var vectorctx = vector.getContext('2d');
        var radius = joystick.width * 0.2;
        var maxRadius = joystick.width * 0.3;
        var backgroundColor = BACKGROUND_COLOR;
        var maxRadiusBGColor = FOREGROUND_COLOR;
        var leftClick = 0;
        //draw canvas in initial state
        drawAll();
        //sets left click flag UP and calls mouseMove handler
        scope.mouseDown = function($event) {
                evt = $event;
                leftClick = 1;
                scope.mouseMove(evt);
            }
            //overrides touch event handler
        scope.touchMove = function(evt) {
                evt.preventDefault();
                leftClick = 1;
                scope.mouseMove(evt);
            }
            //sets left click flag DOWN and resets both canvas to initial state (unless position lock is ON)
        scope.mouseUp = function() {
                leftClick = 0;
                if (!scope.lockJoystick) {
                    scope.resetAll();
                }
            }
            //handles mouse or touch movement on joystick
        scope.mouseMove = function(evt) {
            if (leftClick == 1) { //check if left mouse button down or touch
                //erases previous joystick position
                resetJoystick();
                // erases previous vector
                resetVector();
                // get cursor or touch coordinates, saved in point object.
                if (evt.type == 'touchstart' || evt.type == 'touchmove') {
                    scope.point.x = evt.touches[0].pageX - joystick.offsetLeft;
                    scope.point.y = evt.touches[0].pageY - joystick.offsetTop;
                } else {
                    scope.point.x = evt.pageX - joystick.offsetLeft - 3;
                    scope.point.y = evt.pageY - joystick.offsetTop - 3;
                };
                //make coordinates relative to canvas center
                scope.point = GeometrySrv.centerCoord(scope.point, joystick);
                //if Directional Lock is ON, enforce
                if (scope.lockMode != "fullAnalog") {
                    scope.point = GeometrySrv.forceDirectionLock(scope.point.x, scope.point.y, scope.lockMode);
                }
                // force coordinates into maxRadius
                if (!GeometrySrv.isInsideCircle(scope.point.x, scope.point.y, maxRadius)) {
                    scope.point = GeometrySrv.forceIntoCircle(scope.point.x, scope.point.y, maxRadius);
                }
                //change coordinates back to absolute reference
                scope.point = GeometrySrv.canvasCoord(scope.point, joystick);
                DrawSrv.drawLineFromCenter(joystickctx, scope.point.x, scope.point.y);
                DrawSrv.drawLineFromCenter(vectorctx, scope.point.x * vector.width / joystick.width, scope.point.y * vector.width / joystick.width);
                //redraw joystick position
                DrawSrv.drawCircle(joystickctx, scope.point.x, scope.point.y, radius, maxRadiusBGColor);
                //set relative coordinates
                scope.point = GeometrySrv.centerCoord(scope.point, joystick);
                //send coordinates back to server (websocket)
                updateJoystick(scope.point, scope.lockMode);
            };
        }
        scope.resetAll = function() {
            leftClick = 0;
            drawAll();
            scope.point.x = 0;
            scope.point.y = 0;
            updateJoystick(scope.point, scope.lockMode);
        }

        function resetJoystick() {
            joystickctx.fillStyle = backgroundColor;
            joystickctx.fillRect(0, 0, joystick.width, joystick.height);
            joystickctx.fillStyle = "black";
            DrawSrv.drawCircle(joystickctx, joystick.width / 2, joystick.height / 2, maxRadius, maxRadiusBGColor);
        }

        function resetVector() {
            vectorctx.fillStyle = backgroundColor;
            vectorctx.fillRect(0, 0, vector.width, vector.height);
            vectorctx.fillStyle = "black";
            vectorctx.fillRect(vector.width / 2 - 2, vector.height / 2 - 2, 4, 4);
            DrawSrv.drawCircle(vectorctx, vector.width / 2, vector.height / 2, vector.width * maxRadius / joystick.width);
        }

        function drawAll() {
            resetJoystick();
            resetVector();
            DrawSrv.drawCircle(joystickctx, joystick.width / 2, joystick.height / 2, radius, maxRadiusBGColor);
        }

        function updateJoystick(point, lockMode) {
            SocketSrv.socket.emit('updateJoystick', {
                x: point.x.toFixed(2),
                y: point.y.toFixed(2),
                mode: lockMode
            });
        }
    }
]);
/*
    HTML5 Robot User Interface Web Application
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

app.controller('JoystickController', ['$scope', '$element', 'SocketSrv', 'DrawSrv', 'GeometrySrv', 'ProfileSrv',
    function(scope, element, SocketSrv, DrawSrv, GeometrySrv, ProfileSrv) {
        scope.lockJoystick = false;
        scope.lockMode = 'lock4ways';
        scope.showVector = true;
        scope.point = {
            x: 0,
            y: 0,
        };
        var joystick = element[0].children[0];
        var joystickctx = joystick.getContext('2d');
        var vector = element[0].children[1];
        var vectorctx = vector.getContext('2d');
        joystick.width = 300;
        joystick.height = joystick.width;
        vector.width = 100;
        vector.height = vector.width;
        var radius = joystick.width * 0.2;
        var maxRadius = joystick.width / 3;
        var backgroundColor = BACKGROUND_COLOR;
        var maxRadiusBGColor = FOREGROUND_COLOR;
        var leftClick = 0;
        var renderReq;
        //draw canvas in initial state
        drawAll();
        //start rendering animation
        requestAnimationFrame(renderLoop);

        scope.$on('getProfile', function() {
            ProfileSrv.profile.lockJoystick = scope.lockJoystick;
            ProfileSrv.profile.lockMode = scope.lockMode;
            ProfileSrv.profile.showVector = scope.showVector;
        });
        scope.$on('setProfile', function() {
            scope.lockJoystick = ProfileSrv.profile.lockJoystick;
            scope.lockMode = ProfileSrv.profile.lockMode;
            scope.showVector = ProfileSrv.profile.showVector;
        });
        scope.$on('$destroy', function() {
            cancelAnimationFrame(renderReq);
        });
        //sets left click flag UP and calls mouseMove handler
        scope.mouseDown = function($event) {
            evt = $event;
            leftClick = 1;
            scope.mouseMove(evt);
        };
        //overrides touch event handler
        scope.touchMove = function(evt) {
            evt.preventDefault();
            leftClick = 1;
            scope.mouseMove(evt);
        };
        //sets left click flag DOWN and resets both canvas to initial state (unless position lock is ON)
        scope.mouseUp = function() {
            leftClick = 0;
            if (!scope.lockJoystick) {
                scope.resetAll();
            }
        };
        //handles mouse or touch movement on joystick
        scope.mouseMove = function(evt) {
            if (leftClick == 1) { //check if left mouse button down or touch
                // get cursor or touch coordinates, saved in point object.
                if (evt.type == 'touchstart' || evt.type == 'touchmove') {
                    scope.point.x = evt.targetTouches[0].pageX - joystick.offsetLeft;
                    scope.point.y = evt.targetTouches[0].pageY - joystick.offsetTop;
                } else {
                    scope.point.x = evt.pageX - joystick.offsetLeft - 3;
                    scope.point.y = evt.pageY - joystick.offsetTop - 3;
                };
                //make coordinates relative to canvas center
                scope.point = GeometrySrv.centerCoord(scope.point, joystick);
                //if Directional Lock is ON, enforce
                if (scope.lockMode != "fullAnalog") {
                    scope.point = GeometrySrv.forceDirectionLock(scope.point.x, scope.point.y, scope.lockMode);
                };
                // force coordinates into maxRadius
                if (!GeometrySrv.isInsideCircle(scope.point.x, scope.point.y, maxRadius)) {
                    scope.point = GeometrySrv.forceIntoCircle(scope.point.x, scope.point.y, maxRadius);
                };
                //send coordinates back to server (websocket)
                updateJoystick(scope.point, scope.lockMode);
            };
        };

        function renderLoop() {
            //call renderLoop every 15ms (60fps)
            renderReq = requestAnimationFrame(renderLoop);
            //erases previous joystick position
            resetJoystick();
            // erases previous vector
            resetVector();
            //change coordinates to canvas reference
            scope.point = GeometrySrv.canvasCoord(scope.point, joystick);
            DrawSrv.drawLineFromCenter(joystickctx, scope.point.x, scope.point.y);
            if (scope.showVector) {
                DrawSrv.drawLineFromCenter(vectorctx, scope.point.x * vector.width / joystick.width, scope.point.y * vector.width / joystick.width);
            };
            //redraw joystick position
            DrawSrv.drawCircle(joystickctx, scope.point.x, scope.point.y, radius, maxRadiusBGColor);
            //change back to relative coordinates
            scope.point = GeometrySrv.centerCoord(scope.point, joystick);
        };

        scope.resetAll = function() {
            leftClick = 0;
            drawAll();
            scope.point.x = 0;
            scope.point.y = 0;
            updateJoystick(scope.point, scope.lockMode);
        };

        function resetJoystick() {
            joystickctx.fillStyle = backgroundColor;
            joystickctx.fillRect(0, 0, joystick.width, joystick.height);
            joystickctx.fillStyle = "black";
            DrawSrv.drawCircle(joystickctx, joystick.width / 2, joystick.height / 2, maxRadius, maxRadiusBGColor);
        };

        function resetVector() {
            vectorctx.fillStyle = backgroundColor;
            vectorctx.fillRect(0, 0, vector.width, vector.height);
            vectorctx.fillStyle = "black";
            vectorctx.fillRect(vector.width / 2 - 2, vector.height / 2 - 2, 4, 4);
            DrawSrv.drawCircle(vectorctx, vector.width / 2, vector.height / 2, vector.width * maxRadius / joystick.width);
        };

        function drawAll() {
            resetJoystick();
            resetVector();
            DrawSrv.drawCircle(joystickctx, joystick.width / 2, joystick.height / 2, radius, maxRadiusBGColor);
        };

        function updateJoystick(point, lockMode) {
            SocketSrv.socket.emit('updateJoystick', {
                x: point.x.toFixed(2),
                y: point.y.toFixed(2),
                mode: lockMode,
                joystickItem: element[0].children[0].id,
            });
        };
    },
]);

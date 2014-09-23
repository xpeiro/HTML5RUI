app.controller('JoystickController', ['$scope', 'GeneralSrv',
    function($scope, GeneralSrv) {
        $scope.lockJoystick = false;
        $scope.lockMode = 'fullAnalog';
        $scope.showVector = true;
        $scope.point = {
            x: 0,
            y: 0,
        };
        var joystick = document.getElementById('joystick');
        var joystickctx = joystick.getContext('2d');
        var vector = document.getElementById('vector');
        var vectorctx = vector.getContext('2d');
        var radius = joystick.width * 0.2;
        var maxRadius = joystick.width * 0.35;
        var backgroundColor = "#8598C4";
        var maxRadiusBGColor = "#39538D";
        var leftClick = 0;
        //draw canvas in initial state
        drawAll();
        //sets left click flag UP and calls mouseMove handler
        $scope.mouseDown = function($event) {
            evt = $event;
            leftClick = 1;
            $scope.mouseMove(evt);
        }
        //overrides touch event handler
        $scope.touchMove = function(evt) {
            evt.preventDefault();
            leftClick = 1;
            $scope.mouseMove(evt);
        }
        //sets left click flag DOWN and resets both canvas to initial state (unless position lock is ON)
        $scope.mouseUp = function() {
            leftClick = 0;
            if (!$scope.lockJoystick) {
                $scope.resetAll();
            }
        }
        //handles mouse or touch movement on joystick
        $scope.mouseMove = function(evt) {
            if (leftClick == 1) { //check if left mouse button down or touch
                //erases previous joystick position
                resetJoystick();
                // erases previous vector
                resetVector();
                // get cursor or touch coordinates, saved in point object.
                if (evt.type == 'touchstart' || evt.type == 'touchmove') {
                    $scope.point.x = evt.touches[0].pageX - joystick.offsetLeft;
                    $scope.point.y = evt.touches[0].pageY - joystick.offsetTop;
                } else {
                    $scope.point.x = evt.pageX - joystick.offsetLeft - 3;
                    $scope.point.y = evt.pageY - joystick.offsetTop - 3;
                };
                //make coordinates relative to canvas center
                $scope.point = centerCoord($scope.point, joystick);
                //if Directional Lock is ON, enforce
                if ($scope.lockMode != "fullAnalog") {
                    $scope.point = forceDirectionLock($scope.point.x, $scope.point.y, $scope.lockMode);
                }
                // force coordinates into maxRadius
                if (!isInsideCircle($scope.point.x, $scope.point.y, maxRadius)) {
                    $scope.point = forceIntoCircle($scope.point.x, $scope.point.y, maxRadius);
                }
                //change coordinates back to absolute reference
                $scope.point = canvasCoord($scope.point, joystick);
                drawLineFromCenter(joystickctx, $scope.point.x, $scope.point.y);
                drawLineFromCenter(vectorctx, $scope.point.x * vector.width / joystick.width, $scope.point.y * vector.width / joystick.width);
                //redraw joystick position
                drawCircle(joystickctx, $scope.point.x, $scope.point.y, radius, maxRadiusBGColor);
                //set relative coordinates
                $scope.point = centerCoord($scope.point, joystick);
                //send coordinates back to server (websocket)
                updateJoystick($scope.point, $scope.lockMode);
            };
        }
        $scope.resetAll = function() {
            leftClick = 0;
            drawAll();
            $scope.point.x = 0;
            $scope.point.y = 0;
            updateJoystick($scope.point, $scope.lockMode);
        }

        function resetJoystick() {
            joystickctx.fillStyle = backgroundColor;
            joystickctx.fillRect(0, 0, joystick.width, joystick.height);
            joystickctx.fillStyle = "black";
            drawCircle(joystickctx, joystick.width / 2, joystick.height / 2, maxRadius, maxRadiusBGColor);
        }

        function resetVector() {
            vectorctx.fillStyle = backgroundColor;
            vectorctx.fillRect(0, 0, vector.width, vector.height);
            vectorctx.fillStyle = "black";
            vectorctx.fillRect(vector.width / 2 - 2, vector.height / 2 - 2, 4, 4);
            drawCircle(vectorctx, vector.width / 2, vector.height / 2, vector.width * 0.35);
        }

        function drawAll() {
            resetJoystick();
            resetVector();
            drawCircle(joystickctx, joystick.width / 2, joystick.height / 2, radius, maxRadiusBGColor);
        }

        function drawCircle(ctx, x, y, radius, fillColor) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
            if ( !! fillColor) { //if fillColor arg given, fill in circle.
                ctx.fillStyle = fillColor;
                ctx.fill();
            };
            ctx.stroke();
        }

        function drawLineFromCenter(ctx, x, y) {
            ctx.beginPath();
            ctx.moveTo(ctx.canvas.width / 2, ctx.canvas.height / 2);
            ctx.lineTo(x, y);
            ctx.stroke();
        }

        function writeInCanvas(ctx, font, text, x, y) {
            ctx.font = font;
            ctx.fillText(text, x, y);
        }

        function isInsideCircle(x, y, radius) {
            return ((x * x + y * y) <= (radius * radius));
        }

        function forceIntoCircle(x, y, radius) {
            var a = y / x;
            if (x > 0) {
                x = radius / Math.sqrt(1 + a * a);
            } else {
                x = -radius / Math.sqrt(1 + a * a);
            }
            if (y > 0) {
                y = radius / Math.sqrt(1 + 1 / (a * a));
            } else {
                y = -radius / Math.sqrt(1 + 1 / (a * a));
            }
            return {
                x: x,
                y: y
            };
        }

        function forceDirectionLock(x, y, lockMode) {
            var angle = Math.atan2(Math.abs(y), Math.abs(x));
            switch (lockMode) {
                case "lock8ways":
                    if (angle > 30 * Math.PI / 180 && angle < 60 * Math.PI / 180) {
                        if (x * y > 0) {
                            y = x;
                        } else {
                            y = -x;
                        }
                    } else if (angle < 30 * Math.PI / 180) {
                        y = 0;
                    } else if (angle > 60 * Math.PI / 180) {
                        x = 0;
                    }
                    break;
                case "lock4ways":
                    if (angle < 45 * Math.PI / 180) {
                        y = 0;
                    } else {
                        x = 0;
                    }
                    break;
                case "lock2ways":
                    x = 0;
                    break;
            }
            return {
                x: x,
                y: y
            };
        }

        function centerCoord(point, canvas) {
            return {
                x: point.x - canvas.width / 2,
                y: canvas.height / 2 - point.y,
            };
        }

        function canvasCoord(point, canvas) {
            return {
                x: point.x + canvas.width / 2,
                y: canvas.height / 2 - point.y,
            };
        }

        function updateJoystick(point, lockMode) {
            GeneralSrv.socket.emit('updateJoystick', {
                x: point.x.toFixed(2),
                y: point.y.toFixed(2),
                mode: lockMode
            });
        }
    }
]);
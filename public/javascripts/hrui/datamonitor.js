/*
    HTML5 Robot User Interface Web Application
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

app.controller('DataController', ['$scope', '$element', '$upload', 'SocketSrv', 'DrawSrv', 'ProfileSrv', 'GeometrySrv',
    function(scope, element, $upload, SocketSrv, DrawSrv, ProfileSrv, GeometrySrv) {
        var backgroundColor = BACKGROUND_COLOR;
        var map = element[0].children[3];
        var mapctx = map.getContext('2d');
        var mapimage;
        var leftClick = 0;
        map.width = 300;
        map.height = map.width;
        scope.size = 300;
        scope.mapOn = false;
        scope.mapMode = 'upload';
        scope.relCoord = false;
        scope.position = {
            x: 0,
            y: 0,
            z: 0
        };
        scope.orientation = {
            alpha: 0,
            beta: 0,
            gamma: 0
        };
        scope.speed = {
            vx: 0,
            vy: 0,
            vz: 0
        };
        scope.angularSpeed = {
            dAlpha: 0,
            dBeta: 0,
            dGamma: 0
        };
        scope.point = {
            x: 0,
            y: 0,
        };
        scope.clearMap = function() {
            mapctx.fillStyle = backgroundColor;
            mapctx.fillRect(0, 0, map.width, map.height);
            mapimage = null;
        }
        scope.toggleMap = function(newMapOnValue) {
            if (newMapOnValue) {
                scope.setMapMode(scope.mapMode);
            };
        }
        scope.setMapMode = function(newMapMode) {
            if (newMapMode != 'server') {
                scope.relCoord = false;
            };
            if (newMapMode == 'draw') {
                periodicSendDrawing();
            };
            SocketSrv.socket.emit('setMapMode', newMapMode);
            scope.clearMap();
        };
        scope.upload = function(files) {
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    $upload.upload({
                        url: 'mapupload',
                        fields: {},
                        file: file
                    }).progress(function(evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                    }).success(function(data, status, headers, config) {
                        console.log('file ' + config.file.name + ' uploaded.');
                    });
                }
            }
        };
        //share profile data with ProfileSrv
        scope.$on('getProfile', function() {
            ProfileSrv.profile.size = scope.size;
            ProfileSrv.profile.mapOn = scope.mapOn;
            ProfileSrv.profile.mapMode = scope.mapMode;
        });
        //load profile from ProfileSrv
        scope.$on('setProfile', function() {
            scope.size = ProfileSrv.profile.size;
            scope.mapOn = ProfileSrv.profile.mapOn;
            scope.mapMode = ProfileSrv.profile.mapMode;
        });
        SocketSrv.socket.on('updateData', function(data) {
            scope.position = data.position;
            scope.orientation = data.orientation;
            scope.speed = data.speed;
            scope.angularSpeed = data.angularSpeed;
            if (scope.mapOn && scope.mapMode == 'upload') {
                if (!!mapimage) {
                    mapctx.drawImage(mapimage, 0, 0);
                } else {
                    scope.clearMap();
                };
            };
            if (scope.mapMode != 'server') {
                drawRobot();
            };
            scope.$apply();
        });
        SocketSrv.socket.on('updateMap', function() {
            var img = new Image();
            img.src = 'images/map.png?=' + Date.now();
            img.onload = function() {
                mapctx.drawImage(img, 0, 0);
                drawRobot();
            };
        });
        SocketSrv.socket.on('mapUploaded', function() {
            var img = new Image();
            img.src = 'images/uploadmap?=' + Date.now();
            img.onload = function() {
                mapctx.drawImage(img, 0, 0);
                mapimage = img;
            };
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
        //sets left click flag DOWN
        scope.mouseUp = function() {
            leftClick = 0;
        };
        //handles mouse or touch movement
        scope.mouseMove = function(evt) {
            if (evt.type == 'touchstart' || evt.type == 'touchmove') {
                for (var touch in evt.touches) {
                    if (!!evt.touches[touch].target) {
                        if (evt.touches[touch].target.id == map.id) {
                            scope.point.x = evt.touches[touch].pageX - map.offsetLeft;
                            scope.point.y = evt.touches[touch].pageY - map.offsetTop;
                        };
                    };
                };
            } else {
                scope.point.x = evt.pageX - map.offsetLeft - 3;
                scope.point.y = evt.pageY - map.offsetTop - 3;
            };
            if (leftClick == 1 && scope.mapMode == 'draw') {
                mapctx.fillStyle = "#000000";
                mapctx.fillRect(scope.point.x, scope.point.y, 4, 4);
            };
            scope.point = GeometrySrv.centerCoord(scope.point, map);
            scope.point.x = scope.size * scope.point.x / map.width;
            scope.point.y = scope.size * scope.point.y / map.height;

        };

        function drawRobot() {
            var robotX;
            var robotY;
            var robotAlpha;
            if (!scope.relCoord) {
                robotX = map.width * scope.position.x / scope.size + map.width / 2;
                robotY = -map.width * scope.position.y / scope.size + map.height / 2;
                robotAlpha = scope.orientation.alpha;

            } else {
                robotX = map.width / 2;
                robotY = map.height / 2;
                robotAlpha = Math.PI/2;
            };
            DrawSrv.drawCircle(mapctx, robotX, robotY, 5, "blue");
            mapctx.beginPath();
            mapctx.moveTo(robotX, robotY);
            mapctx.lineTo(robotX + 12 * Math.cos(robotAlpha), robotY - 12 * Math.sin(robotAlpha));
            mapctx.strokeStyle = "blue";
            mapctx.lineWidth = 2;
            mapctx.stroke();
        };

        function periodicSendDrawing() {
            SocketSrv.socket.emit('updateMapDrawing', map.toDataURL());
            if (scope.mapMode == 'draw' && !!element.scope()) {
                setTimeout(function() {
                    periodicSendDrawing();                    
                }, 500);
            };
        };
    },
]);

/*
    HTML5 Robot User Interface Web Application
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

app.controller('DataController', ['$scope', '$upload', 'SocketSrv', 'DrawSrv', 'ProfileSrv',
    function(scope, $upload, SocketSrv, DrawSrv, ProfileSrv) {
        var backgroundColor = BACKGROUND_COLOR;
        var map = document.getElementById('mapcanvas');
        var mapctx = map.getContext('2d');
        var mapimage;
        map.width = 300;
        map.height = map.width;
        scope.size = 300;
        scope.mapOn = false;
        scope.mapMode = 'upload';

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
                DrawSrv.drawCircle(mapctx, scope.size * scope.position.x + map.width / 2, -scope.size * scope.position.y + map.height / 2, 5, "black");
            };
            scope.$apply();
        });
        SocketSrv.socket.on('updateMap', function() {
            var img = new Image();
            img.src = 'images/map.png?=' + Date.now();
            img.onload = function() {
                mapctx.drawImage(img, 0, 0);
                DrawSrv.drawCircle(mapctx, scope.size * scope.position.x + map.width / 2, -scope.size * scope.position.y + map.height / 2, 5, "black");
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
    },
]);

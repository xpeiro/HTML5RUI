/*
    HTML5 Robot User Interface Web Application
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

app.controller('DataController', ['$scope', 'SocketSrv', 'DrawSrv', 'ProfileSrv',
    function(scope, SocketSrv, DrawSrv, ProfileSrv) {
        var map = document.getElementById('mapcanvas');
        var mapctx = map.getContext('2d');
        map.width = 300;
        map.height = map.width;
        var backgroundColor = BACKGROUND_COLOR;
        scope.scale = 60;
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
        //share profile data with ProfileSrv
        scope.$on('getProfile', function() {
            ProfileSrv.profile.scale = scope.scale;
        });
        //load profile from ProfileSrv
        scope.$on('setProfile', function() {
            scope.scale = ProfileSrv.profile.scale;
        });
        SocketSrv.socket.on('updateData', function(data) {

            mapctx.fillStyle = backgroundColor;
            mapctx.fillRect(0, 0, map.width, map.height);

            DrawSrv.drawCircle(mapctx, scope.scale * data.position.x + map.width / 2, -scope.scale * data.position.y + map.height / 2, 5, "black");
            scope.position = data.position;
            scope.orientation = data.orientation;
            scope.speed = data.speed;
            scope.angularSpeed = data.angularSpeed;
            scope.$apply();
        });
    },
]);

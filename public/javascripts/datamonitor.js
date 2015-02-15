app.controller('DataController', ['$scope', 'SocketSrv', 'DrawSrv',
    function($scope, SocketSrv, DrawSrv) {
        var map = document.getElementById('mapcanvas');
        var mapctx = map.getContext('2d');
        var backgroundColor = "#8598C4";
        $scope.scale =60;


        $scope.position = {
        	x: 0,
            y: 0,
            z: 0
        };
        $scope.orientation = {
            alpha: 0,
            beta: 0,
            gamma: 0
        };
        $scope.speed = {
            vx: 0,
            vy: 0,
            vz: 0
        };
        $scope.angularSpeed = {
            dAlpha: 0,
            dBeta: 0,
            dGamma: 0
        };


        SocketSrv.socket.on('updateData', function(data) {
            
            mapctx.fillStyle = backgroundColor;
            mapctx.fillRect(0, 0, map.width, map.height);
            
            DrawSrv.drawCircle(mapctx,$scope.scale*data.position.x+map.width/2,-$scope.scale*data.position.y+map.height/2,5,"black");
            $scope.position = data.position;
            $scope.orientation = data.orientation;
            $scope.speed = data.speed;
            $scope.angularSpeed = data.angularSpeed;            
            $scope.$apply();            
        });
    },
]);

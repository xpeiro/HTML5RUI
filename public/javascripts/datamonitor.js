app.controller('DataController', ['$scope', 'GeneralSrv',
    function($scope, GeneralSrv) {
        var map = document.getElementById('mapcanvas');
        var mapctx = map.getContext('2d');
        var arrow = new Image();
        arrow.src = 'arrow.png';
        var backgroundColor = "#8598C4";
        $scope.scale =60;
        function drawCircle(ctx, x, y, radius, fillColor) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
            if ( !! fillColor) { //if fillColor arg given, fill in circle.
                ctx.fillStyle = fillColor;
                ctx.fill();
            };
            ctx.stroke();
        }

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


        GeneralSrv.socket.on('updateData', function(data) {
            
            mapctx.fillStyle = backgroundColor;
            mapctx.fillRect(0, 0, joystick.width, joystick.height);
            
            drawCircle(mapctx,$scope.scale*data.position.x+map.width/2,-$scope.scale*data.position.y+map.height/2,5,"black");
            $scope.position = data.position;
            $scope.orientation = data.orientation;
            $scope.speed = data.speed;
            $scope.angularSpeed = data.angularSpeed;            
            $scope.$apply();            
        });
    }
]);
// mapctx.save();
// mapctx.translate(map.width/2, map.height/2);
// mapctx.translate(10,6);
// mapctx.rotate(3.14159*data.orientation.beta/180);
// mapctx.restore();
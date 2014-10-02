app.controller('DataController', ['$scope', 'GeneralSrv',
    function($scope, GeneralSrv) {
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
            $scope.position = data.position;
            $scope.orientation = data.orientation;
            $scope.speed = data.speed;
            $scope.angularSpeed = data.angularSpeed;
            $scope.$apply();            
        });
    }
]);
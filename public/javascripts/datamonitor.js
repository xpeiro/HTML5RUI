app.controller('DataController', ['$scope', 'GeneralSrv',
    function($scope, GeneralSrv) {
        $scope.position = {
        	x: 0,
            y: 0,
            z: 0
        };

        GeneralSrv.socket.on('update', function(data) {
            $scope.position = data;
            $scope.$apply();            
        });
    }
]);
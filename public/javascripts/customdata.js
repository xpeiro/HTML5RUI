app.controller('CustomDataController', ['$scope', '$sce', 'SocketSrv',
    function($scope, $sce, SocketSrv) {
    	$scope.customdata = {
    		item: 'customdatatest',
    		updateInterval: 1000,
    	}
        $scope.customdataFormSubmitted = false;
        $scope.customdataTable = $sce.trustAsHtml('Test:<input type={{item}}>');
        $scope.customdataFormSubmit = function() {
        	SocketSrv.socket.emit('customdataFormSubmitted', $scope.customdata);
            $scope.customdataFormSubmitted = true;
        }
        SocketSrv.socket.on('updateCustomData', function(data) {});
    }
]);
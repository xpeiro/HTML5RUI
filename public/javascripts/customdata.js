app.controller('CustomDataController', ['$scope', '$sce', 'SocketSrv',
    function($scope, $sce, SocketSrv) {
        $scope.customDataRequest = {
            item: 'customDataTest',
            updateInterval: 1000,
        }
        $scope.customDataFormSubmitted = false;
        $scope.customDataTable = $sce.trustAsHtml('Waiting for first update...');
        $scope.customDataFormSubmit = function() {
            if ($scope.customDataRequest.updateInterval < 100) {
                $scope.customDataRequest.updateInterval = 100;
            } else if (!($scope.customDataRequest.updateInterval % 100 == 0)) {
                if ($scope.customDataRequest.updateInterval % 100 >= 50) {
                    $scope.customDataRequest.updateInterval = Math.floor($scope.customDataRequest.updateInterval / 100) * 100 + 100;
                } else {
                    $scope.customDataRequest.updateInterval = Math.floor($scope.customDataRequest.updateInterval / 100) * 100;
                }
            }
            SocketSrv.socket.emit('customDataFormSubmitted', $scope.customDataRequest);
            $scope.customDataFormSubmitted = true;
        }
        SocketSrv.socket.on('updateCustomdata', function(data) {
            var customDataTable = "";
            customDataTable = generateTable(data, customDataTable);
            $scope.customDataTable = $sce.trustAsHtml(customDataTable);
            $scope.$apply();
        });
        generateTable = function(data, customDataTable) {
            for (var key in data) {
                
                if (typeof data[key] === 'object') {
                    var keyTableCell = "<tr><td><b>" + key.toString() + "</b></td></tr>";
                    customDataTable = customDataTable.concat(keyTableCell);
                    customDataTable = generateTable(data[key], customDataTable);
                } else {
                    var keyTableCell = "<tr><td>" + key.toString() + "</td>";
                    var valueTableCell = "<td>" + data[key].toString() + "</td></tr>";
                    customDataTable = customDataTable.concat(keyTableCell);
                    customDataTable = customDataTable.concat(valueTableCell);
                }
            };
            return customDataTable;
        };
    }
]);
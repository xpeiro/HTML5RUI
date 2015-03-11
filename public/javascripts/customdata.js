app.controller('CustomDataController', ['$scope', 'SocketSrv', 'ProfileSrv',
    function(scope, SocketSrv, ProfileSrv) {
        scope.customDataRequest = {
            item: 'customDataTest',
            updateInterval: 1000,
        }
        scope.customDataFormSubmitted = false;
        scope.customDataTable = 'Waiting for first update...';
        //share profile data to profile service
        scope.$on('getProfile', function() {
            ProfileSrv.profile.customDataRequest = scope.customDataRequest;
            ProfileSrv.profile.customDataFormSubmitted = scope.customDataFormSubmitted;
        });
        //load profile from ProfileSrv
        scope.$on('setProfile', function() {
            scope.customDataRequest = ProfileSrv.profile.customDataRequest;
            scope.customDataFormSubmitted = ProfileSrv.profile.customDataFormSubmitted;
            SocketSrv.socket.emit('customDataFormSubmitted', scope.customDataRequest);
        });
        scope.customDataFormSubmit = function() {
            if (scope.customDataRequest.updateInterval < 100) {
                scope.customDataRequest.updateInterval = 100;
            } else if (!(scope.customDataRequest.updateInterval % 100 == 0)) {
                if (scope.customDataRequest.updateInterval % 100 >= 50) {
                    scope.customDataRequest.updateInterval = Math.floor(scope.customDataRequest.updateInterval / 100) * 100 + 100;
                } else {
                    scope.customDataRequest.updateInterval = Math.floor(scope.customDataRequest.updateInterval / 100) * 100;
                }
            }
            SocketSrv.socket.emit('customDataFormSubmitted', scope.customDataRequest);
            scope.customDataFormSubmitted = true;
        };
        SocketSrv.socket.on('updateCustomdata', function(data) {
            var customDataTable = "";
            customDataTable = generateTable(data, customDataTable);
            scope.customDataTable = customDataTable;
            scope.$apply();
        });
        generateTable = function(data, customDataTable) {
            if (data == null) {
                return 'No Data Recieved';
            };
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

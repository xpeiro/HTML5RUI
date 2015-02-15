app.controller('CustomDataController', ['$scope', 'SocketSrv',
    function($scope, SocketSrv) {

        SocketSrv.socket.on('updateCustomData', function(data) {

        });
    }
]);
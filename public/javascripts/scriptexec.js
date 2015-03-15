app.controller('ScriptExecController', ['$scope', 'SocketSrv',
    function(scope, SocketSrv) {
        scope.scripts = {};
        // fetch available scripts every 5 seconds
        scope.fetchScripts = function() {
            SocketSrv.socket.emit('fetchScripts');
            setTimeout(scope.fetchScripts, 5000);
        };

        scope.runScript = function(script) {
            SocketSrv.socket.emit('runScript', script.name);
        };
        scope.killScript = function(script) {
            SocketSrv.socket.emit('killScript', script.name);
        };
        // parse fetched scripts and assign standby status to all
        SocketSrv.socket.on('fetchedScripts', function(scripts) {
            for (var i = 0; i < scripts.length; i++) {
                scope.scripts[scripts[i]] = {
                    name: scripts[i],
                    status: 'standby',
                };
            };
            scope.$apply();
        });
        //fetch scripts on controller load
        scope.fetchScripts();
    }
]);

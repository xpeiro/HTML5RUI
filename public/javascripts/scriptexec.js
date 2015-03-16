app.controller('ScriptExecController', ['$scope', 'SocketSrv',
    function(scope, SocketSrv) {
        scope.scripts = {};
        scope.stdout = "stdout: ";
        scope.stderr = "stderr: ";
        // fetch available scripts on load
        scope.fetchScripts = function() {
            SocketSrv.socket.emit('fetchScripts');
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
                    showRun: true,
                };
            };
            scope.$apply();
        });

        SocketSrv.socket.on('scriptRunning', function(scriptName) {
            scope.scripts[scriptName].status = 'running';
            scope.scripts[scriptName].showRun = false;
            scope.$apply();
        });
        SocketSrv.socket.on('scriptError', function(scriptName) {
            scope.scripts[scriptName].status = 'killed';
            scope.scripts[scriptName].showRun = true;
            scope.$apply();
        });
        SocketSrv.socket.on('scriptStdout', function(stdout) {
            scope.stdout = "stdout: " + stdout;
        });
        SocketSrv.socket.on('scriptStderr', function(stderr) {
            scope.stderr = "stderr: " + stderr;
        });

        //fetch scripts on controller load
        scope.fetchScripts();
    }
]);

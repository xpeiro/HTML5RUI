/*
    HTML5 Robot User Interface Web Application
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

/*
	Annyang Copyright (c) 2014 Tal Ater, used under MIT License.
*/

app.controller('VoiceCommandsController', ['$scope', 'SocketSrv', 'ProfileSrv',
    function(scope, SocketSrv, ProfileSrv) {
        scope.selectedLanguage = 'en-US'; 
        scope.currentResult = 'Transcript:';
        scope.newCommand = {
            command: '',
            value: '',
        };
        scope.commands = {
            command1: {
                command: 'testing',
                value: 'testing',
            },
        };
        scope.commandExists = false;
        scope.addCommandClicked = false;
        scope.noOfCommands = 1;

        scope.addNewCommand = function() {
            scope.commandExists = false;
            for (var existingComm in scope.commands) {
                if (scope.commands[existingComm].command == scope.newCommand.command) {
                    scope.commandExists = true;
                };
            };
            if (!scope.commandExists) {
                scope.noOfCommands++;
                scope.commands['command' + scope.noOfCommands] = new Object();
                scope.commands['command' + scope.noOfCommands].command = scope.newCommand.command;
                scope.commands['command' + scope.noOfCommands].value = scope.newCommand.value;
                scope.addCommandClicked = false;
            };
        };
        scope.languageSelected = function () {
        	annyang.setLanguage(scope.selectedLanguage);
        	console.log(scope.selectedLanguage);        	
        }

        //share profile data with ProfileSrv
        scope.$on('getProfile', function() {
            ProfileSrv.profile.commands = scope.commands;
        });
        //load profile from ProfileSrv
        scope.$on('setProfile', function() {
            scope.commands = ProfileSrv.profile.commands;
            for (var command in scope.commands) {
                scope.commands[command].lastHeard = false;
            };
        });

        //catches any command, compares to registered commands, on match, sends value to back-end.
        function newVoiceCommand(command) {
            for (var registeredComm in scope.commands) {
                if (command == scope.commands[registeredComm].command) {
                    SocketSrv.socket.emit('voiceCommand', scope.commands[registeredComm].value);
                    //mark as last heard command
                    scope.commands[registeredComm].lastHeard = true;
                } else {
                    //erase last heard command
                    scope.commands[registeredComm].lastHeard = false;
                };
            };
            scope.currentResult = scope.currentResult.concat('; ' + command);

            scope.$apply();
        };

        if (annyang) {
            //create a command with a 'splat', that catches any words and forwards result to newVoiceCommand
            var command = {
                    '*command': newVoiceCommand,
                }
                //add command
            annyang.addCommands(command);
            // Start listening.            
            annyang.start();
        };
    },
]);

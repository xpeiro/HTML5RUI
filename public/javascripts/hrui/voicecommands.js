/*
    HTML5 Robot User Interface Web Application
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

/*
    Annyang Copyright (c) 2014 Tal Ater, used under MIT License.
*/

app.controller('VoiceCommandsController', ['$scope', '$upload', 'SocketSrv', 'ProfileSrv',
    function(scope, $upload, SocketSrv, ProfileSrv) {
        scope.getUserMediaSupported = true;
        scope.annyangSupported = true;
        scope.manualVoiceCommandEnabled = true;
        scope.onlyMatchingCommands = true;
        scope.selectedLanguage = 'en-US';
        scope.currentResult = 'Transcript:';
        scope.newCommand = {
            command: '',
            value: '',
        };
        scope.commands = {
            command1: {
                command: 'Testing',
                value: 'Testing',
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
        scope.languageSelected = function() {
            annyang.abort();
            annyang.setLanguage(scope.selectedLanguage);
            annyang.start();
        };

        scope.manualVoiceCommand = function() {
            scope.manualVoiceCommandEnabled = false;
            navigator.getUserMedia({
                audio: true
            }, function(stream) {
                recordAudio = RecordRTC(stream, {
                    bufferSize: 16384
                });

                recordAudio.startRecording();
                setTimeout(function() {
                    recordAudio.stopRecording(function() {
                        recordAudio.getDataURL(function(audioDataURL) {
                            SocketSrv.socket.emit('manualVoiceCommand', audioDataURL);
                        });
                        scope.manualVoiceCommandEnabled = true;
                        scope.$apply();
                    });
                }, 5000);
            }, function(error) {
                console.log(error);
            });

        };

        //share profile data with ProfileSrv
        scope.$on('getProfile', function() {
            ProfileSrv.profile.commands = scope.commands;
            ProfileSrv.profile.onlyMatchingCommands = scope.onlyMatchingCommands;
        });
        //load profile from ProfileSrv
        scope.$on('setProfile', function() {
            scope.commands = ProfileSrv.profile.commands;
            scope.onlyMatchingCommands = ProfileSrv.profile.onlyMatchingCommands;
            for (var command in scope.commands) {
                scope.commands[command].lastHeard = false;
            };
        });
        //stop annyang on module exit
        scope.$on('$destroy', function() {
            if (annyang) {
                annyang.abort();
            };
        });

        //gets command from annyang, compares to registered commands, on match, sends value to back-end.
        function newVoiceCommand(command) {
            var value = '';
            for (var registeredComm in scope.commands) {
                if (command.toLowerCase() == scope.commands[registeredComm].command.toLowerCase()) {
                    value = scope.commands[registeredComm].value;
                    //mark as last heard command
                    scope.commands[registeredComm].lastHeard = true;
                } else {
                    //erase last heard command
                    scope.commands[registeredComm].lastHeard = false;
                };
            };
            //send to backend (if user selected to send all commands or if there was a match)
            if (!scope.onlyMatchingCommands || value.length > 0) {
                SocketSrv.socket.emit('voiceCommand', {
                    command: command,
                    value: value,
                });
            };
            //append the transcript to textarea regardless of match.
            scope.currentResult = scope.currentResult.concat(' ' + command + ';');
            scope.$apply();
        };

        if (!!!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia)) {
            scope.getUserMediaSupported = false;
        };

        if (annyang) {
            //create a command with a 'splat', that catches any words and forwards result to newVoiceCommand
            var command = {
                '*command': newVoiceCommand,
            };
            //add command
            annyang.addCommands(command);
            // Start listening.            
            annyang.start();
        } else {
            scope.annyangSupported = false;
        }
    },
]);

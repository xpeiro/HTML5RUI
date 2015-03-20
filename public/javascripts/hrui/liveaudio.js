/*
    HTML5 Robot User Interface Web Application
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

/*
 Live Audio Decoding in FLAC, using aurora.js and flac.js 
 and aurora-websocket.js plugin
 Credit:
 Audiocogs: http://audiocogs.org/
 Audiocogs github: https://github.com/audiocogs
 aurora.js Framework : https://github.com/audiocogs/aurora.js
 flac.js FLAC JS Decoder: https://github.com/audiocogs/flac.js
 Aurora Websocket Plugin by fsbdev: https://github.com/fsbdev
*/
app.controller('LiveAudioController', ['$scope', 'SocketSrv',
    function(scope, SocketSrv) {
        var wsurl = 'ws://' + location.hostname + ':' + SocketSrv.AUDIOWSPORT;
        SocketSrv.wsPlayer = AV.Player.fromWebSocket(wsurl);
        SocketSrv.wsPlayer.play();        
    }
]);

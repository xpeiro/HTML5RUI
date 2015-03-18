/*
 Live Audio Decoding in FLAC, using aurora.js and flac.js.
 Used under MIT License, Credit:
 Audiocogs: http://audiocogs.org/
 Audiocogs github: https://github.com/audiocogs
 aurora.js Framework : https://github.com/audiocogs/aurora.js
 flac.js FLAC JS Decoder: https://github.com/audiocogs/flac.js
*/


app.controller('LiveAudioController', ['$scope', 'SocketSrv',
    function(scope, SocketSrv) {
    	var AUDIOWSPORT = 4000;
        var wsurl = 'ws'.concat(document.URL.slice(4, document.URL.lastIndexOf('/')).concat(':' + AUDIOWSPORT + '/'));
        console.log(wsurl);
        SocketSrv.wsPlayer = AV.Player.fromWebSocket(wsurl);
        SocketSrv.wsPlayer.play();
    }
]);

/*
    HTML5 Robot User Interface Web Application
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2014-2015    
*/

/*
CODE ADAPTED TO ANGULARJS FROM ORIGINAL WORK by Dominic Szablewski - phoboslab.org, github.com/phoboslab:
http://phoboslab.org/log/2013/09/html5-live-video-streaming-via-websockets/ 
*/
app.controller('LiveVideoController', ['$scope', 'SocketSrv',
    function(scope, SocketSrv) {
        var videoCanvas = document.getElementById('videoCanvas');
        var ctx = videoCanvas.getContext('2d');
        scope.videoDevice = SocketSrv.VIDEODEVICE;
        videoCanvas.width = 320;
        videoCanvas.height = 240;
        ctx.fillStyle = '#444';
        ctx.fillText('Loading...', videoCanvas.width / 2 - 30, videoCanvas.height / 3);
        // get URL
        var wsurl = 'ws://' + location.hostname + ':' + SocketSrv.VIDEOWSPORT;
        // Setup the WebSocket connection and start the player        
        SocketSrv.videowsocket = new WebSocket(wsurl);
        var player = new jsmpeg(SocketSrv.videowsocket, {
            canvas: videoCanvas
        });
        scope.videoDeviceSelected = function(videoDevice) {
            SocketSrv.socket.emit('mediaDeviceSelected', {
                streamType: 'videoStream',
                deviceNum: videoDevice,
            });
        };
    }
]);

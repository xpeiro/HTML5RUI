function hasGetUserMedia() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

if (hasGetUserMedia()) {
    console.log('ok')
} else {
    alert('getUserMedia() is not supported in your browser');
}


navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;



function errorcallback(err) {
    console.log('done fucked up: ' + err)
}

// Not showing vendor prefixes.
navigator.getUserMedia({
    audio: true
}, function(stream) {
    recordAudio = RecordRTC(stream, {
        bufferSize: 16384
    });

    recordAudio.startRecording();
    setTimeout(function() {
        recordAudio.stopRecording();

        recordAudio.getDataURL(function(audioDataURL) {
            var files = {
                audio: {
                    name: 'a.wav',
                    type: 'audio/wav',
                    contents: audioDataURL
                }
            };
            var video = document.querySelector('audio');
            video.src = audioDataURL;
        });
    }, 5000);
}, errorcallback);


function upload(files) {
    if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            $upload.upload({
                url: 'audioupload',
                fields: {},
                file: file
            }).progress(function(evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            }).success(function(data, status, headers, config) {
                console.log('file ' + config.file.name + ' uploaded.');
            });
        }
    }
};

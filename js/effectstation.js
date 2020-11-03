requirejs(['audioContext'], function(audioContext){
    window.context = audioContext.init();
    window.masterVolume = audioContext.createGainNode(context, context.destination, 1);
    window.reverbUnit = audioContext.createReverbUnit(context, masterVolume);
    audioContext.getAudioByXhr('../audio/In The Silo Revised.wav', window.reverbUnit.convolver);
    window.panner = audioContext.createStereoPannerNode(context, window.reverbUnit.input, 0);
    window.analyser = audioContext.createAnalyserNode(context, panner);
    window.echoUnit = audioContext.createDualEchoUnit(context, analyser);
    window.compressor = audioContext.createCompressorUnit(context, echoUnit.input);
    window.filter1 = audioContext.createBiquadFilterNode(
        context,
        compressor.input,
        document.querySelector('#filter1Type').value,
        Math.pow(2, document.querySelector('#filter1frequency').value) * 55,
        document.querySelector('#filter1Q').value,
        document.querySelector('#filter1Gain').value
        );
    window.lfo1 = audioContext.createLfoNode(context, filter1.frequency, 'sine', 0.1, 100);
    window.gainStage = audioContext.createGainNode(context, filter1, 1);
    window.distortion = audioContext.createWaveShaperNode(context, gainStage, audioContext.makeDistortionCurve(400), 'none' );
    distortion.setCurve = function(amount){
        distortion.curve = audioContext.makeDistortionCurve(amount);
    }
    window.input = audioContext.createUserMediaNode(context, distortion);
    window.bufferLength = analyser.frequencyBinCount;
    window.dataArray = new Uint8Array(bufferLength);
    var canvas = document.querySelector("#oscilliscope canvas");
    window.canvasCtx = canvas.getContext("2d");
    window.drawWaveform = function(){
        analyser.getByteTimeDomainData(dataArray);
        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.lineWidth = 1;
        canvasCtx.strokeStyle = 'rgb(0, 255, 0)';
        canvasCtx.beginPath();
        var sliceWidth = canvasCtx.canvas.width * 1.0 / bufferLength;
        var x = 0;
        for(var i = 0; i < bufferLength; i++) {
            var v = dataArray[i] / 128.0;
            var y = v * canvasCtx.canvas.height/2;
            if(i === 0) {
              canvasCtx.moveTo(x, y);
            } else {
              canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        canvasCtx.lineTo(canvas.width, canvas.height/2);
        canvasCtx.stroke();
    }
    window.drawFrequencyGraph = function(){
        analyser.getByteFrequencyData(dataArray);
        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
        canvasCtx.fillStyle = 'rgb(200, 0, 0)';
        var sliceWidth = canvasCtx.canvas.width * 1.0 / bufferLength;
        var x = 0;
        for(var i = 0; i < bufferLength; i++) {
            var v = dataArray[i] / 128.0;
            var y = v * canvasCtx.canvas.height;
            canvasCtx.fillRect(x, canvasCtx.canvas.height - y, sliceWidth, y);
            x += sliceWidth;
        }
        canvasCtx.lineTo(canvas.width, canvas.height/2);
        canvasCtx.stroke();
    }
    window.animateDisplay = function(){
        canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
        drawFrequencyGraph();
        drawWaveform();
        requestAnimationFrame(animateDisplay);
    }
    animateDisplay();
});
function simplythiser(audioContext){
    const g$ = window;
    const $ = document.querySelector.bind(document);
    g$.context = audioContext.init();
    g$.masterVolume = audioContext.createGainNode(context, context.destination, 1);
    g$.convolver = audioContext.createConvolverNode(context, masterVolume, null);
    audioContext.getAudioByXhr('audio/In The Silo Revised.wav', g$.convolver);
    g$.panner = audioContext.createStereoPannerNode(context, convolver, 0);
    g$.analyser = audioContext.createAnalyserNode(context, panner);
    g$.delay = audioContext.createDelayNode(context, analyser, 0.5);
    g$.delayFeedback = audioContext.createGainNode(context, delay, 0.8);
    delay.connect(delayFeedback);
    g$.compressor = audioContext.createDynamicsCompressorNode(
        context,
        delay,
        $('#dynamicsThreshold').value,
        $('#dynamicsKnee').value,
        $('#dynamicsRatio').value,
        $('#dynamicsAttack').value,
        $('#dynamicsRelease').value
        );
    compressor.connect(analyser);
    g$.gainStage = audioContext.createGainNode(context, compressor, 0);
    g$.distortion = audioContext.createWaveShaperNode(context, gainStage, audioContext.makeDistortionCurve(400), 'none' );
    distortion.setCurve = function(amount){
        distortion.curve = audioContext.makeDistortionCurve(amount);
    }
    g$.filter1 = audioContext.createBiquadFilterNode(
        context,
        distortion,
        $('#filter1Type').value,
        Math.pow(2, $('#filter1frequency').value) * 55,
        $('#filter1Q').value,
        $('#filter1Gain').value
        );
    g$.osc1 = audioContext.createOscillatorNode(
        context,
        filter1,
        $('#oscillator1Type').value,
        Math.pow(2, $('#oscillator1Octave').value) * 55,
        0
        );
    g$.osc2 = audioContext.createOscillatorNode(
        context,
        filter1,
        $('#oscillator2Type').value,
        (Math.pow(2, $('#oscillator1Octave').value) * 55) * Math.pow(2, $('#oscillator2Octave').value),
        $('#oscillator2Detune').value
        );
    g$.lfo1 = audioContext.createLfoNode(context, filter1.frequency, 'sine', 0.1, 100);
    g$.envelope = function(context, audioParam, startValue, peakValue, attackTime, decayTime, sustainValue, holdTime, releaseTime){
        audioContext.linearEnvelopeADSR(context, audioParam, startValue, peakValue, attackTime, decayTime, sustainValue, holdTime, releaseTime);
    };
    g$.runRandomValueSequencer = function(context, interval, objects){
        const now = context.currentTime;
        for(var i = 0, t = 1; i < objects.length; i++, t++){
            objects[i].forEach(function(element, index, array){
                setTimeout(
                    setValue,
                    (t * 1000 * interval)-20,
                    element.target,
                    (Math.random() * (element.max - element.min)) + element.min,
                    now + (t * interval)
                );
            }
        )}
    }
    g$.setValue = function(param, value, time){
        param.exponentialRampToValueAtTime(value, time);
    }
    g$.bufferLength = analyser.frequencyBinCount;
    g$.dataArray = new Uint8Array(bufferLength);
    var canvas = $("#oscilliscope canvas");
    g$.canvasCtx = canvas.getContext("2d"); 
    g$.drawWaveform = function(){
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
    g$.drawFrequencyGraph = function() {
        analyser.getByteFrequencyData(dataArray);
        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
        canvasCtx.fillStyle = 'rgb(200, 0, 0)';
        var sliceWidth = canvasCtx.canvas.width * 1.0 / bufferLength;
        var x = 0;
        for (var i = 0; i < bufferLength; i++) {
            var v = dataArray[i] / 128.0;
            var y = v * canvasCtx.canvas.height / 2.5;
            canvasCtx.fillRect(x, canvasCtx.canvas.height - y, sliceWidth, y);
            x += sliceWidth;
        }
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }
    var filterCanvas = $("#filter1 canvas");
    g$.filterCanvasCtx = filterCanvas.getContext("2d"); 
    g$.drawFilterResponse = function(filter){
        const width = filterCanvasCtx.canvas.width;
        const height = filterCanvasCtx.canvas.height;
        var noctaves = 8;
        var sampleRate = 44100.0;
        var nyquist = 0.5 * sampleRate;
        var freq = new Float32Array(width);
        var magResponse = new Float32Array(width);
        var phaseResponse = new Float32Array(width);
        for (var k = 0; k < width; ++k) {
            var f = k / width;
            // Convert to log frequency scale (octaves).
            f = Math.pow(2.0, noctaves * (f - 1.0));
            freq[k] = f * nyquist;
        }
        filter1.getFrequencyResponse(freq, magResponse, phaseResponse);
        var magData = [];
        var phaseData = [];
        for (var k = 0; k < width; ++k) {
            db = 20.0 * Math.log(magResponse[k])/Math.LN10;
            phaseDeg = 180 / Math.PI * phaseResponse[k];
            magData.push([freq[k] , db]);
            phaseData.push([freq[k], phaseDeg]);
        }
        filterCanvasCtx.fillStyle = 'rgb(0, 0, 0)';
        filterCanvasCtx.fillRect(0, 0, width, height);
        filterCanvasCtx.lineWidth = 1;
        filterCanvasCtx.strokeStyle = 'rgb(0, 255, 0)';
        filterCanvasCtx.beginPath();
        var x = 0;
        scale = 0.2;
        for(var i = 0; i < width; i++){
            var y = (magResponse[i] * (height/2)) + (height/2);
            if(i === 0) {
              filterCanvasCtx.moveTo(i, height - (y * scale));
            } else {
              filterCanvasCtx.lineTo(i, height - (y * scale));
            }
        }
        filterCanvasCtx.lineTo(filterCanvas.width, filterCanvas.height/2);
        filterCanvasCtx.stroke();
    }
    g$.animateDisplay = function(){
        canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
        drawFrequencyGraph();
        drawWaveform();
        drawFilterResponse();
        requestAnimationFrame(animateDisplay);

    }
    animateDisplay()
    g$.initSimplethiser = function(){
        $('form').style.opacity = 1;
        $('body').style.overflow = 'auto';
        $('.init-button').style.display = 'none';
        g$.osc1.start(0);
        g$.osc2.start(0);
    };
};

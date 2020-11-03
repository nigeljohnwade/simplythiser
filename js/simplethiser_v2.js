requirejs(['audioContext', 'redux.min'], function(audioContext, redux){
    const SAVE_PATCH = 'SAVE_PATCH';
    const UPDATE_PROPERTY = 'UPDATE_PROPERTY';
    function createSavePatch(patch){
        return {type: SAVE_PATCH, patch};
    }
    window.createUpdateProperty = function(optionsObject){
        return {type: UPDATE_PROPERTY, optionsObject};
    }    
    const initialState ={ 
        patch:{
            oscillator: {
                oscillator1Type: document.querySelector('#oscillator1Type').value,
                oscillator1Frequency: Math.pow(2, document.querySelector('#oscillator1Octave').value) * 55,
                oscillator2Type: document.querySelector('#oscillator2Type').value,
                oscillator2Frequency: (Math.pow(2, document.querySelector('#oscillator1Octave').value) * 55) * Math.pow(2, document.querySelector('#oscillator2Octave').value),
                oscillator2Detune: document.querySelector('#oscillator2Detune').value,
                oscillator2Octave: document.querySelector('#oscillator2Octave').value
            }
        }
    }
    function patchApp(state, action){
        if (typeof state === 'undefined') {
            return initialState;
        }
        let newState = Object.assign({}, state);
        switch(action.type){
            case SAVE_PATCH:
                return Object.assign({}, state, {patch: action.patch});
            case UPDATE_PROPERTY:
                newState.patch[action.optionsObject.key.split('.')[0]][action.optionsObject.key.split('.')[1]] = action.optionsObject.value;
                return newState;                
            default:
                return state;
        }
        return state;
    }
    window.store = redux.createStore(patchApp);
    let unsubscribe = window.store.subscribe(function(){
        var state = window.store.getState();
        window.osc1.type = state.patch.oscillator.oscillator1Type;
        window.osc2.type = state.patch.oscillator.oscillator2Type;
        window.osc1.frequency,value = parseFloat(state.patch.oscillator.oscillator1Frequency);
        window.osc2.frequency.value = parseFloat(state.patch.oscillator.oscillator2Frequency);
        window.osc2.detune.value = parseFloat(state.patch.oscillator.oscillator2Detune);
        console.log(state);
        }
    )
    //debugger;
    window.context = audioContext.init();
    window.masterVolume = audioContext.createGainNode(context, context.destination, 1);
    window.panner = audioContext.createStereoPannerNode(context, masterVolume, 0);
    window.analyser = audioContext.createAnalyserNode(context, panner);
    window.convolver = audioContext.createConvolverNode(context, analyser, null);
    audioContext.getAudioByXhr('../audio/In The Silo Revised.wav', window.convolver);
    //audioContext.getAudioByXhr('../audio/Inchdown.wav', window.convolver);
    //audioContext.getAudioByXhr('../audio/BathHouse.wav', window.convolver);
    //audioContext.getAudioByXhr('../audio/MesaBoogieStudio22.wav', window.convolver);
    //audioContext.getAudioByXhr('../audio/French 18th Century Salon.wav', window.convolver);
    window.dualEchoUnit = audioContext.createDualEchoUnit(context, convolver, 0.5, 0.6, 1);
    window.compressor = audioContext.createCompressorUnit(context, dualEchoUnit.input);
    //window.compressor = audioContext.createDynamicsCompressorNode(
    //    context,
    //    dualEchoUnit.input  ,
    //    document.querySelector('#dynamicsThreshold').value,
    //    document.querySelector('#dynamicsKnee').value,
    //    document.querySelector('#dynamicsRatio').value,
    //    document.querySelector('#dynamicsAttack').value,
    //    document.querySelector('#dynamicsRelease').value
    //    );
    compressor.output.connect(analyser);
    window.gainStage = audioContext.createGainNode(context, compressor.input, 0);
    window.distortion = audioContext.createWaveShaperNode(context, gainStage, audioContext.makeDistortionCurve(400), 'none' );
    distortion.setCurve = function(amount){
        distortion.curve = audioContext.makeDistortionCurve(amount);
    }
    window.filter1 = audioContext.createBiquadFilterNode(
        context,
        distortion,
        document.querySelector('#filter1Type').value,
        Math.pow(2, document.querySelector('#filter1frequency').value) * 55,
        document.querySelector('#filter1Q').value,
        document.querySelector('#filter1Gain').value
        );
    window.osc1 = audioContext.createOscillatorNode(
        context,
        filter1,
        document.querySelector('#oscillator1Type').value,
        Math.pow(2, document.querySelector('#oscillator1Octave').value) * 55,
        0
        );
    window.osc2 = audioContext.createOscillatorNode(
        context,
        filter1,
        document.querySelector('#oscillator2Type').value,
        (Math.pow(2, document.querySelector('#oscillator1Octave').value) * 55) * Math.pow(2, document.querySelector('#oscillator2Octave').value),
        document.querySelector('#oscillator2Detune').value
        );
    osc1.start(0);
    osc2.start(0);
    window.lfo1 = audioContext.createLfoNode(context, filter1.frequency, 'sine', 0.1, 100);
    window.envelope = function(context, audioParam, startValue, peakValue, attackTime, decayTime, sustainValue, holdTime, releaseTime){
        audioContext.linearEnvelopeADSR(context, audioParam, startValue, peakValue, attackTime, decayTime, sustainValue, holdTime, releaseTime);
    };
    window.runRandomValueSequencer = function(context, interval, objects){
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
    window.runValueSequencer = function(context, interval, duration, objects){
        const now = context.currentTime;
        var i = 0, t = 1;
        while(i < duration/interval){
            objects[i % objects.length].forEach(function(element, index, array){
                setTimeout(
                    setValue,
                    (t * 1000 * interval)-20,
                    element.target,
                    element.value,
                    now + (t * interval)
                );
            });
            i++;
            t++;
        }
    }
    window.setValue = function(param, value, time){
        param.exponentialRampToValueAtTime(value, time);
    }
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
            var y = v * canvasCtx.canvas.height/2.5;
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

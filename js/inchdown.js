'use strict';
requirejs(['audioContext'], function(audioContext){
    window.context = audioContext.init();
    window.masterVolume = audioContext.createGainNode(context, context.destination, 1);
    window.panner = audioContext.createStereoPannerNode(context, window.masterVolume, 0);
    window.analyser = audioContext.createAnalyserNode(context, window.panner);
    window.reverbUnit = audioContext.createReverbUnit(context, window.analyser);
    audioContext.getAudioByXhr('../audio/BathHouse.wav', window.reverbUnit.convolver);

    //UI component code
    var tmpl = document.querySelector('.reverbUnit');
    var ReverbUnitProto = Object.create(HTMLElement.prototype);
    ReverbUnitProto.createdCallback = function() {
        var root = this.createShadowRoot();
        root.appendChild(document.importNode(tmpl.content, true));
        root.querySelector('#reverbUnitBypass').addEventListener('change', function(event){
            const bypass = event.target.checked;
            if(bypass){
                root.host.setAttribute('bypass', 'bypass');
            }else{
                root.host.removeAttribute('bypass');
            }
        });
        root.querySelector('#reverbUnitWetFilter').addEventListener('change', function(event){
            const wetFilter = event.target.value;
            root.host.setAttribute('wetfilter', wetFilter);
        });
    };
    ReverbUnitProto.attachedCallback = function(a){
        this.querySelector('legend').textContent = 'Reverberation'
    }
    ReverbUnitProto.attributeChangedCallback = function(name, oldValue, newValue) {
        console.log(arguments);
        if(name === 'bypass'){
            reverbUnit.bypass(newValue);
        }
        if(name === 'wetfilter'){
            reverbUnit.wetFilter.frequency.setValueAtTime(parseFloat(newValue), 0.02);
        }
    }
    var ReverbUnit = document.registerElement('reverb-unit', {
        prototype: ReverbUnitProto
    });

    
    window.input = audioContext.createUserMediaNode(context, reverbUnit.input);
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
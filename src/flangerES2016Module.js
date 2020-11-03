import audioContext from 'audioContextES2016Module.js';
window.context = audioContext.init();
window.masterVolume = audioContext.createGainNode(context, context.destination, 1);
window.panner = audioContext.createStereoPannerNode(context, window.masterVolume, 0);
window.analyser = audioContext.createAnalyserNode(context, panner);
window.flangerUnit = audioContext.createDualFlangerUnit(context, analyser);
window.compressor = audioContext.createCompressorUnit(context, flangerUnit.input);
window.gainStage = audioContext.createGainNode(context, compressor.input, 1);
window.input = audioContext.createUserMediaNode(context, gainStage);
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

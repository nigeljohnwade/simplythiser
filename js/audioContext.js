'use strict';

define({
    init: function init() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        return new AudioContext();
    },
    //Primitive Nodes
    createOscillatorNode: function createOscillatorNode(context, destination) {
        const waveform = arguments.length <= 2 || arguments[2] === undefined ? 'sine' : arguments[2];
        const frequency = arguments.length <= 3 || arguments[3] === undefined ? 440 : arguments[3];
        const detune = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];

        if (!context) {
            throw 'No ac defined';
        }
        const _osc = context.createOscillator();
        _osc.type = waveform;
        _osc.frequency.value = frequency;
        _osc.detune.value = detune;
        if (destination) {
            _osc.connect(destination);
        }
        return _osc;
    },
    createBiquadFilterNode: function createBiquadFilterNode(context, destination) {
        const type = arguments.length <= 2 || arguments[2] === undefined ? 'lowpass' : arguments[2];
        const frequency = arguments.length <= 3 || arguments[3] === undefined ? 350 : arguments[3];
        const q = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];
        const gain = arguments.length <= 5 || arguments[5] === undefined ? 0 : arguments[5];

        if (!context) {
            throw 'No ac defined';
        }
        const _filter = context.createBiquadFilter();
        _filter.type = type;
        _filter.frequency.value = frequency;
        _filter.Q.value = q;
        _filter.gain.value = gain;
        if (destination) {
            _filter.connect(destination);
        }
        return _filter;
    },
    createAnalyserNode: function createAnalyserNode(context, destination) {
        const fftSize = arguments.length <= 2 || arguments[2] === undefined ? 2048 : arguments[2];
        const minDecibels = arguments.length <= 3 || arguments[3] === undefined ? -100 : arguments[3];
        const maxDecibels = arguments.length <= 4 || arguments[4] === undefined ? -30 : arguments[4];

        if (!context) {
            throw 'No ac defined';
        }
        const _analyser = context.createAnalyser();
        _analyser.fftSize = fftSize;
        _analyser.minDecibels = minDecibels;
        _analyser.maxDecibels = maxDecibels;
        if (destination) {
            _analyser.connect(destination);
        }
        return _analyser;
    },
    createGainNode: function createGainNode(context, destination) {
        const gain = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

        if (!context) {
            throw 'No ac defined';
        }
        const _gain = context.createGain();
        _gain.gain.value = gain;
        if (destination) {
            _gain.connect(destination);
        }
        return _gain;
    },
    createDynamicsCompressorNode: function createDynamicsCompressorNode(context, destination) {
        const threshold = arguments.length <= 2 || arguments[2] === undefined ? -24 : arguments[2];
        const knee = arguments.length <= 3 || arguments[3] === undefined ? 30 : arguments[3];
        const ratio = arguments.length <= 4 || arguments[4] === undefined ? 12 : arguments[4];
        const attack = arguments.length <= 5 || arguments[5] === undefined ? 0.003 : arguments[5];
        const release = arguments.length <= 6 || arguments[6] === undefined ? 0.25 : arguments[6];

        if (!context) {
            throw 'No ac defined';
        }
        const _comp = context.createDynamicsCompressor();
        _comp.threshold.value = threshold;
        _comp.knee.value = knee;
        _comp.ratio.value = ratio;
        _comp.attack.value = attack;
        _comp.release.value = release;
        if (destination) {
            _comp.connect(destination);
        }
        return _comp;
    },
    createWaveShaperNode: function createWaveShaperNode(context, destination) {
        const curve = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
        const oversample = arguments.length <= 3 || arguments[3] === undefined ? 'none' : arguments[3];

        if (!context) {
            throw 'No ac defined';
        }
        const _waveShaper = context.createWaveShaper();
        _waveShaper.curve = curve;
        _waveShaper.oversample = oversample;
        if (destination) {
            _waveShaper.connect(destination);
        }
        return _waveShaper;
    },
    createDelayNode: function createDelayNode(context, destination) {
        const delay = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

        if (!context) {
            throw 'No ac defined';
        }
        const _delay = context.createDelay();
        _delay.delayTime.value = delay;
        if (destination) {
            _delay.connect(destination);
        }
        return _delay;
    },
    createStereoPannerNode: function createStereoPannerNode(context, destination) {
        const pan = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

        if (!context) {
            throw 'No ac defined';
        }
        const _pan = context.createStereoPanner();
        _pan.pan.value = pan;
        if (destination) {
            _pan.connect(destination);
        }
        return _pan;
    },
    createConvolverNode: function createConvolverNode(context, destination) {
        const buffer = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        if (!context) {
            throw 'No ac defined';
        }
        const _convolver = context.createConvolver();
        if (buffer) {
            _convolver.buffer = buffer;
        }
        if (destination) {
            _convolver.connect(destination);
        }
        return _convolver;
    },
    createAudioBufferSourceNode: function createAudioBufferSourceNode(context, destination) {
        const buffer = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        if (!context) {
            throw 'No ac defined';
        }
        const _buffer = context.createBufferSource();
        if (buffer) {
            _buffer.buffer = buffer;
        }
        if (destination) {
            _buffer.connect(destination);
        }
        return _buffer;
    },
    createUserMediaNode: function createUserMediaNode(context, destination) {
        if (!context) {
            throw 'No ac defined';
        }
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        let _source;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({ audio: true }, function (stream) {
                _source = context.createMediaStreamSource(stream);
                if (destination) {
                    _source.connect(destination);
                }
            }, function (err) {
                console.log(err);
            });
        }
    },
    //Utilities
    makeDistortionCurve: function makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50,
            n_samples = 44100,
            curve = new Float32Array(n_samples),
            deg = Math.PI / 180,
            i = 0,
            x = void 0;
        for (; i < n_samples; ++i) {
            const x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    },
    linearEnvelopeADSR: function linearEnvelopeADSR(context, audioParam, startValue, peakValue, attackTime, decayTime, sustainValue, holdTime, releaseTime) {
        if (!context) {
            throw 'No ac defined';
        }
        const currentTime = context.currentTime;
        audioParam.cancelScheduledValues(currentTime);
        audioParam.setValueAtTime(startValue, currentTime);
        audioParam.linearRampToValueAtTime(peakValue, currentTime + attackTime);
        audioParam.linearRampToValueAtTime(sustainValue, currentTime + attackTime + decayTime);
        audioParam.linearRampToValueAtTime(startValue, currentTime + attackTime + decayTime + holdTime + releaseTime);
    },
    getAudioByXhr: function getAudioByXhr(url, reference) {
        if (!reference) {
            throw 'No reference defined';
        }
        const ajaxRequest = new XMLHttpRequest();
        ajaxRequest.open('GET', url, true);
        ajaxRequest.responseType = 'arraybuffer';
        ajaxRequest.onload = function () {
            const audioData = ajaxRequest.response;
            ac.decodeAudioData(audioData, function (buffer) {
                window.concertHallBuffer = buffer;
                window.soundSource = ac.createBufferSource();
                window.soundSource.buffer = window.concertHallBuffer;
                reference.buffer = buffer;
            }, function (e) {
                "Error with decoding audio data" + e.err;
            });
        };
        ajaxRequest.send();
    },
    //Compound Nodes
    createLfoNode: function createLfoNode(context, destination) {
        const waveform = arguments.length <= 2 || arguments[2] === undefined ? 'sine' : arguments[2];
        const frequency = arguments.length <= 3 || arguments[3] === undefined ? 0.1 : arguments[3];
        const gain = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];

        if (!context) {
            throw 'No ac defined';
        }
        const _lfo = {};
        _lfo.gain = this.createGainNode(context, destination, gain);
        _lfo.oscillator = this.createOscillatorNode(context, _lfo.gain, waveform, frequency, 0);
        _lfo.oscillator.start(0);
        return _lfo;
    },
    //Effects Units
    createEchoUnit: function createEchoUnit(context, destination) {
        const delay = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
        const feedback = arguments.length <= 3 || arguments[3] === undefined ? 0.6 : arguments[3];
        const wetSignal = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];

        if (!context) {
            throw 'No ac defined';
        }
        const _echoUnit = {};
        _echoUnit.input = this.createGainNode(context);
        _echoUnit.wetChannel = this.createGainNode(context);
        _echoUnit.dryChannel = this.createGainNode(context, null, wetSignal);
        _echoUnit.delay = this.createDelayNode(context, null, delay);
        _echoUnit.feedback = this.createGainNode(context, null, feedback);
        _echoUnit.output = this.createGainNode(context);
        _echoUnit.input.connect(_echoUnit.wetChannel);
        _echoUnit.input.connect(_echoUnit.dryChannel);
        _echoUnit.dryChannel.connect(_echoUnit.output);
        _echoUnit.wetChannel.connect(_echoUnit.delay);
        _echoUnit.delay.connect(_echoUnit.feedback);
        _echoUnit.feedback.connect(_echoUnit.delay);
        _echoUnit.delay.connect(_echoUnit.output);
        _echoUnit.output.connect(destination);
        _echoUnit.bypass = function () {
            const state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            if (state) {
                this.wetChannel.disconnect(this.delay);
            } else {
                this.wetChannel.connect(this.delay);
            }
        };
        return _echoUnit;
    },
    createDualEchoUnit: function createDualEchoUnit(context, destination) {
        const delay = arguments.length <= 2 || arguments[2] === undefined ? 0.4 : arguments[2];
        const feedback = arguments.length <= 3 || arguments[3] === undefined ? 0.6 : arguments[3];
        const wetSignal = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];

        if (!context) {
            throw 'No ac defined';
        }
        const _echoUnit = {};
        _echoUnit.input = this.createGainNode(context);
        _echoUnit.wetChannelLeft = this.createGainNode(context, null, wetSignal);
        _echoUnit.wetChannelRight = this.createGainNode(context, null, wetSignal);
        _echoUnit.dryChannel = this.createGainNode(context);
        _echoUnit.delayLeft = this.createDelayNode(context, null, delay);
        _echoUnit.delayRight = this.createDelayNode(context, null, delay * 1.5);
        _echoUnit.feedbackLeft = this.createGainNode(context, null, feedback);
        _echoUnit.feedbackRight = this.createGainNode(context, null, feedback * 1.5);
        _echoUnit.panLeft = this.createStereoPannerNode(context, null, -1);
        _echoUnit.panRight = this.createStereoPannerNode(context, null, 1);
        _echoUnit.output = this.createGainNode(context);
        _echoUnit.input.connect(_echoUnit.wetChannelLeft);
        _echoUnit.input.connect(_echoUnit.wetChannelRight);
        _echoUnit.input.connect(_echoUnit.dryChannel);
        _echoUnit.dryChannel.connect(_echoUnit.output);
        _echoUnit.wetChannelLeft.connect(_echoUnit.delayLeft);
        _echoUnit.wetChannelRight.connect(_echoUnit.delayRight);
        _echoUnit.delayLeft.connect(_echoUnit.feedbackLeft);
        _echoUnit.feedbackLeft.connect(_echoUnit.delayLeft);
        _echoUnit.delayLeft.connect(_echoUnit.panLeft);
        _echoUnit.delayRight.connect(_echoUnit.feedbackRight);
        _echoUnit.feedbackRight.connect(_echoUnit.delayRight);
        _echoUnit.delayRight.connect(_echoUnit.panRight);
        _echoUnit.panRight.connect(_echoUnit.output);
        _echoUnit.panLeft.connect(_echoUnit.output);
        _echoUnit.output.connect(destination);
        _echoUnit.bypass = function () {
            const state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            if (state) {
                this.wetChannelLeft.disconnect(this.delayLeft);
                this.wetChannelRight.disconnect(this.delayRight);
            } else {
                this.wetChannelLeft.connect(this.delayLeft);
                this.wetChannelRight.connect(this.delayRight);
            }
        };
        return _echoUnit;
    },
    createReverbUnit: function createReverbUnit(context, destination) {
        const wetSignal = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

        if (!context) {
            throw 'No ac defined';
        }
        const _reverb = {};
        _reverb.input = this.createGainNode(context);
        _reverb.wetChannel = this.createGainNode(context, null, wetSignal);
        _reverb.dryChannel = this.createGainNode(context);
        _reverb.convolver = this.createConvolverNode(context);
        _reverb.output = this.createGainNode(context, null, 1);
        _reverb.wetFilter = this.createBiquadFilterNode(context, null, 'lowpass', 1350, 0, 0);
        _reverb.input.connect(_reverb.dryChannel);
        _reverb.input.connect(_reverb.wetChannel);
        _reverb.dryChannel.connect(_reverb.output);
        _reverb.wetChannel.connect(_reverb.convolver);
        _reverb.convolver.connect(_reverb.wetFilter);
        _reverb.wetFilter.connect(_reverb.output);
        _reverb.output.connect(destination);
        _reverb.bypass = function () {
            const state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            if (state) {
                this.wetChannel.disconnect(_reverb.convolver);
            } else {
                this.wetChannel.connect(_reverb.convolver);
            }
        };
        return _reverb;
    },
    createFlangerUnit: function createFlangerUnit(context, destination) {
        const delay = arguments.length <= 2 || arguments[2] === undefined ? 0.013 : arguments[2];
        const feedback = arguments.length <= 3 || arguments[3] === undefined ? 0.9 : arguments[3];
        const wetSignal = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];

        if (!context) {
            throw 'No ac defined';
        }
        const _flangerUnit = {};
        _flangerUnit.input = this.createGainNode(context);
        _flangerUnit.wetChannel = this.createGainNode(context);
        _flangerUnit.dryChannel = this.createGainNode(context, null, wetSignal);
        _flangerUnit.delay = this.createDelayNode(context, null, delay);
        _flangerUnit.feedback = this.createGainNode(context, null, feedback);
        _flangerUnit.output = this.createGainNode(context);
        _flangerUnit.lfo = this.createLfoNode(context, _flangerUnit.delay.delayTime, 'triangle', 0.1, 0.004);
        _flangerUnit.input.connect(_flangerUnit.wetChannel);
        _flangerUnit.input.connect(_flangerUnit.dryChannel);
        _flangerUnit.dryChannel.connect(_flangerUnit.output);
        _flangerUnit.wetChannel.connect(_flangerUnit.delay);
        _flangerUnit.delay.connect(_flangerUnit.feedback);
        _flangerUnit.feedback.connect(_flangerUnit.delay);
        _flangerUnit.delay.connect(_flangerUnit.output);
        _flangerUnit.output.connect(destination);
        _flangerUnit.bypass = function () {
            const state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            if (state) {
                this.wetChannel.disconnect(this.delay);
            } else {
                this.wetChannel.connect(this.delay);
            }
        };
        return _flangerUnit;
    },
    createDualFlangerUnit: function createDualFlangerUnit(context, destination) {
        const delay = arguments.length <= 2 || arguments[2] === undefined ? 0.013 : arguments[2];
        const feedback = arguments.length <= 3 || arguments[3] === undefined ? 0.9 : arguments[3];
        const wetSignal = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];

        if (!context) {
            throw 'No ac defined';
        }
        const _flangerUnit = {};
        _flangerUnit.input = this.createGainNode(context);
        _flangerUnit.wetChannelLeft = this.createGainNode(context);
        _flangerUnit.wetChannelRight = this.createGainNode(context);
        _flangerUnit.dryChannel = this.createGainNode(context, null, wetSignal);
        _flangerUnit.delayLeft = this.createDelayNode(context, null, delay);
        _flangerUnit.feedbackLeft = this.createGainNode(context, null, feedback);
        _flangerUnit.delayRight = this.createDelayNode(context, null, delay);
        _flangerUnit.feedbackRight = this.createGainNode(context, null, feedback);
        _flangerUnit.panLeft = this.createStereoPannerNode(context, null, -1);
        _flangerUnit.panRight = this.createStereoPannerNode(context, null, 1);
        _flangerUnit.wetFilter = this.createBiquadFilterNode(context, null, 'lowpass', 1350, 0, 0);
        _flangerUnit.output = this.createGainNode(context);
        _flangerUnit.lfo1 = this.createLfoNode(context, _flangerUnit.delayLeft.delayTime, 'triangle', 0.1, 0.004);
        _flangerUnit.lfo2 = this.createLfoNode(context, _flangerUnit.delayRight.delayTime, 'triangle', 0.1, 0.004);
        _flangerUnit.input.connect(_flangerUnit.wetChannelLeft);
        _flangerUnit.input.connect(_flangerUnit.wetChannelRight);
        _flangerUnit.input.connect(_flangerUnit.dryChannel);
        _flangerUnit.dryChannel.connect(_flangerUnit.output);
        _flangerUnit.wetChannelLeft.connect(_flangerUnit.delayLeft);
        _flangerUnit.wetChannelRight.connect(_flangerUnit.delayRight);
        _flangerUnit.delayLeft.connect(_flangerUnit.feedbackLeft);
        _flangerUnit.feedbackLeft.connect(_flangerUnit.delayLeft);
        _flangerUnit.delayRight.connect(_flangerUnit.feedbackRight);
        _flangerUnit.feedbackRight.connect(_flangerUnit.delayRight);
        _flangerUnit.delayLeft.connect(_flangerUnit.wetFilter);
        _flangerUnit.delayRight.connect(_flangerUnit.wetFilter);
        _flangerUnit.wetFilter.connect(_flangerUnit.output);
        _flangerUnit.output.connect(destination);
        _flangerUnit.bypass = function () {
            const state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            if (state) {
                this.wetChannelLeft.disconnect(this.delayLeft);
                this.wetChannelRight.disconnect(this.delayRight);
            } else {
                this.wetChannelLeft.connect(this.delayLeft);
                this.wetChannelRight.connect(this.delayRight);
            }
        };
        return _flangerUnit;
    },
    createDualChorusUnit: function createDualChorusUnit(context, destination) {
        const delay = arguments.length <= 2 || arguments[2] === undefined ? 0.13 : arguments[2];
        const feedback = arguments.length <= 3 || arguments[3] === undefined ? 0.2 : arguments[3];
        const wetSignal = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];

        if (!context) {
            throw 'No ac defined';
        }
        const _chorusUnit = {};
        _chorusUnit.input = this.createGainNode(context);
        _chorusUnit.wetChannelLeft = this.createGainNode(context);
        _chorusUnit.wetChannelRight = this.createGainNode(context);
        _chorusUnit.dryChannel = this.createGainNode(context, null, wetSignal);
        _chorusUnit.delayLeft = this.createDelayNode(context, null, delay);
        _chorusUnit.feedbackLeft = this.createGainNode(context, null, feedback);
        _chorusUnit.delayRight = this.createDelayNode(context, null, delay);
        _chorusUnit.feedbackRight = this.createGainNode(context, null, feedback);
        _chorusUnit.panLeft = this.createStereoPannerNode(context, null, -1);
        _chorusUnit.panRight = this.createStereoPannerNode(context, null, 1);
        _chorusUnit.output = this.createGainNode(context);
        _chorusUnit.lfo1 = this.createLfoNode(context, _chorusUnit.delayLeft.delayTime, 'triangle', 0.1, 0.04);
        _chorusUnit.lfo2 = this.createLfoNode(context, _chorusUnit.delayRight.delayTime, 'triangle', 0.1, 0.04);
        _chorusUnit.input.connect(_chorusUnit.wetChannelLeft);
        _chorusUnit.input.connect(_chorusUnit.wetChannelRight);
        _chorusUnit.input.connect(_chorusUnit.dryChannel);
        _chorusUnit.dryChannel.connect(_chorusUnit.output);
        _chorusUnit.wetChannelLeft.connect(_chorusUnit.delayLeft);
        _chorusUnit.wetChannelRight.connect(_chorusUnit.delayRight);
        _chorusUnit.delayLeft.connect(_chorusUnit.feedbackLeft);
        _chorusUnit.feedbackLeft.connect(_chorusUnit.delayLeft);
        _chorusUnit.delayRight.connect(_chorusUnit.feedbackRight);
        _chorusUnit.feedbackRight.connect(_chorusUnit.delayRight);
        _chorusUnit.delayLeft.connect(_chorusUnit.output);
        _chorusUnit.delayRight.connect(_chorusUnit.output);
        _chorusUnit.output.connect(destination);
        _chorusUnit.bypass = function () {
            const state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            if (state) {
                this.wetChannelLeft.disconnect(this.delayLeft);
                this.wetChannelRight.disconnect(this.delayRight);
            } else {
                this.wetChannelLeft.connect(this.delayLeft);
                this.wetChannelRight.connect(this.delayRight);
            }
        };
        return _chorusUnit;
    },
    createCompressorUnit: function createCompressorUnit(context, destination) {
        if (!context) {
            throw 'No ac defined';
        }
        const _compressorUnit = {};
        _compressorUnit.input = this.createGainNode(context);
        _compressorUnit.compressor = this.createDynamicsCompressorNode(context);
        _compressorUnit.output = this.createGainNode(context);
        _compressorUnit.input.connect(_compressorUnit.compressor);
        _compressorUnit.compressor.connect(_compressorUnit.output);
        _compressorUnit.output.connect(destination);
        _compressorUnit.bypass = function () {
            const state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            if (state) {
                this.input.disconnect(this.compressor);
                this.input.connect(this.output);
            } else {
                this.input.connect(this.compressor);
                this.input.disconnect(this.output);
            }
        };
        return _compressorUnit;
    }
});
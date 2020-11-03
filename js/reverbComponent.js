'use strict';

//UI component code
var tmpl = document.querySelector('.reverbUnit');
var ReverbUnitProto = Object.create(HTMLElement.prototype);
ReverbUnitProto.createdCallback = function () {
    var root = this.createShadowRoot();
    root.appendChild(document.importNode(tmpl.content, true));
    root.querySelector('#reverbUnitBypass').addEventListener('change', function (event) {
        var bypass = event.target.checked;
        if (bypass) {
            root.host.setAttribute('bypass', 'bypass');
        } else {
            root.host.removeAttribute('bypass');
        }
    });
    root.querySelector('#reverbUnitWetFilter').addEventListener('change', function (event) {
        var wetFilter = event.target.value;
        root.host.setAttribute('wetfilter', wetFilter);
    });
};
ReverbUnitProto.attachedCallback = function (a) {
    this.querySelector('legend').textContent = 'Reverberation';
};
ReverbUnitProto.attributeChangedCallback = function (name, oldValue, newValue) {
    console.log(arguments);
    if (name === 'bypass') {
        reverbUnit.bypass(newValue);
    }
    if (name === 'wetfilter') {
        reverbUnit.wetFilter.frequency.setValueAtTime(parseFloat(newValue), 0.02);
    }
};
var ReverbUnit = document.registerElement('reverb-unit', {
    prototype: ReverbUnitProto
});
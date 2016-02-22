var url = window.location.href;
console.log('Running content script in: ' + url);

var beaconUrl = 'http://localhost:8000/tests/content-script-ajax.html';
console.log('Making ajax call to: ' + beaconUrl);
var ajax = new XMLHttpRequest();
ajax.onreadystatechange = function() {
    if (ajax.readyState == 4 && ajax.status == 200) {
        console.log('Beacon called: ' + beaconUrl);
    }
};
ajax.open('GET', beaconUrl, true);
ajax.send();


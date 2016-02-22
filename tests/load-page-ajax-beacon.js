var beaconUrl = 'page-ajax-beacon.html';
var ajax = new XMLHttpRequest();
ajax.onreadystatechange = function() {
    if (ajax.readyState == 4 && ajax.status == 200) {
        console.log('Beacon called: ' + beaconUrl);
    }
};
ajax.open('GET', beaconUrl, true);
ajax.send();
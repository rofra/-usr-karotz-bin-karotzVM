include('util.js');

var buttonListener = function(event) {
    if ((event=='SIMPLE') || (event=='DOUBLE')) {
		karotz.multimedia.stop();
		exit();
	}
}

var onKarotzConnect = function(data) {
	karotz.led.fade('ff0000', 3000);
	karotz.multimedia.play('http://stream.letsgozik.org:8000/letsgozik');
	karotz.button.addListener(buttonListener);
	setTimeout(300000, function(){ ping(); return true; });
}

var karotz_ip = 'localhost';
var data = {};

karotz.connectAndStart(karotz_ip, 9123, onKarotzConnect, data);
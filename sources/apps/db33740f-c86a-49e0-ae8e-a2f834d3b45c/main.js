// http://wizz.cc
//
include('util.js');

var tmp3 = [
'-',		// Ne pas enlever !
'http://www.la-libellule.fr/karotz/contes_2/1.mp3',
'http://www.la-libellule.fr/karotz/contes_2/2.mp3',
'http://www.la-libellule.fr/karotz/contes_2/3.mp3',
'http://www.la-libellule.fr/karotz/contes_2/4.mp3',
'http://www.la-libellule.fr/karotz/contes_2/5.mp3',
'http://www.la-libellule.fr/karotz/contes_2/6.mp3',
'http://www.la-libellule.fr/karotz/contes_2/7.mp3',
'http://www.la-libellule.fr/karotz/contes_2/8.mp3',
'http://www.la-libellule.fr/karotz/contes_2/9.mp3',
'http://www.la-libellule.fr/karotz/contes_2/10.mp3'		// pas de , apr�s le dernier de la liste
];
	
var indMax = 10;		// Nb de contes
var indice = parseInt(params[instanceName].mp3);
if (indice==0) indice = Math.floor((Math.random()*(indMax-1)))+1; // 1..n

var fquit = parseInt(params[instanceName].fquit);

var url = tmp3[indice];
var bpause = false;

var buttonListener = function(event) {
	if (event == 'LONG_START') {
		karotz.led.fade('FF0000', 3000);
		karotz.multimedia.play(url, evtMM); bpause = false;
		return true;
	}
	if (event == 'SIMPLE') {
		if (!bpause) {
			bpause = true; karotz.led.pulse('00FF00', 3500, -1);
        	karotz.multimedia.pause();
		}	else {
			karotz.led.fade('0000FF', 3000);
        	karotz.multimedia.resume(); bpause = false;
		}
	}
    if (event == 'DOUBLE') {
		karotz.multimedia.stop(); pause(500); exit();
	}
	return true;
}

var earsListener = function(event, step, length) {
	if (event.indexOf('START') >= 0) {
		if (event == 'START_RIGHT') indice = Math.floor((Math.random()*(indMax-1)))+1;
			else if (++indice > indMax) indice = 1;
		url = tmp3[indice];
		karotz.led.fade('FF00FF', 3000);
		karotz.multimedia.play(url, evtMM); bpause = false;
	}
	return true;
}

var evtMM = function(event) {
    if (((event == 'CANCELLED') || (event == 'TERMINATED')) && !bpause) {
		if (!fquit) {
			if (++indice > indMax) indice = 1;
			url = tmp3[indice]; karotz.multimedia.play(url, evtMM);
		} else { karotz.multimedia.stop(); pause(3000); exit(); }
	}
	return true;
}

var onKarotzConnect = function(data) {
	karotz.button.addListener(buttonListener);
	karotz.ears.addListener(earsListener);

	setTimeout(300000, function(){ log('ping'); ping(); return true; });

	karotz.led.fade('FF0000', 3000);
	karotz.multimedia.play(url, evtMM);
}

var karotz_ip = 'localhost';
var data = {};

karotz.connectAndStart(karotz_ip, 9123, onKarotzConnect, data);
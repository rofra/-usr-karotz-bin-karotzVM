include("util.js");
include("tinyxmldom.js");
var karotz_ip = "localhost"; //ici votre adresse IP  ou localhost  pour la version embarquée.

var pause = true;

var buttonListener = function(event){
  if (event == "SIMPLE") {//appui simple permet de mettre en pause / reprendre la lecture du flux radio
    karotz.led.light("000000");
    pause = !pause;
    if (!pause) {
      karotz.led.pulse("75FF00", 500, -1); //le clignotement est jaune et plus rapide pour indiquer une pause
      karotz.multimedia.pause();
    }
    else 
    {
      karotz.led.pulse("0000FF", 2000, -1);
      karotz.multimedia.resume();
    }
  }
  if (event == "DOUBLE") {
    karotz.multimedia.stop();
    exit();
  }
  return true;
}

var onKarotzConnect = function(data){
  karotz.led.light("00FF00");
  karotz.led.pulse("0000FF", 2000, -1); //cligotement bleu, pulse de 2 secondes, boucle indéfiniment
  var data = http.get( "http://downloads.bbc.co.uk/podcasts/worldservice/how2/rss.xml");
  var objDom = new XMLDoc(data);
  var domTree = objDom.docNode;
  var url = domTree.selectNode("/channel/item[0]/enclosure").getAttribute("url");
  karotz.button.addListener(buttonListener);
  karotz.multimedia.play(url);
}

karotz.connectAndStart(karotz_ip, 9123, onKarotzConnect, {});
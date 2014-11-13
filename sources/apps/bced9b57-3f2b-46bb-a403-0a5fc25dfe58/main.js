include("util.js");
include("twitter.js");
include("data.js");
include("lib_twitpic.js");
include("led.js");
include("lib_googleasr.js");
include("lib_soundcloud.js");
include("postMessage.js");
include("sound.js");

log("START TWITTER");

var transTxt = function(txt){
  return txt[g_lang]
}

var tts = function(txt,cb){
  if (cb)  karotz.tts.start(txt[g_lang],g_lang,cb);
  else karotz.tts.start(txt[g_lang],g_lang);
}

asrTwitter = {'fr':"fil {$='timeline'} | mention {$='mention'} | message {$='message'} | nouveau tweet {$='newtweet'} | photo {$='photo'} | son {$='audio'} | photo et son {$='audio_photo'}",
            'en':"timeline {$='timeline'} | mention {$='mention'} | message {$='message'} | new tweet {$='newtweet'} | photo {$='photo'} | audio {$='audio'} | photo and audio {$='audio_photo'}"};

var nothingFunc = function(){}
var global_dblClic = function(){
  returnAndSave(); 
  karotz.asr.string(transTxt(asrTwitter),g_lang ,launch);
}

var returnAndSave = nothingFunc
var simpleClicEvent = nothingFunc
var longClicEvent = global_dblClic;

var contentOption = 0;
var nbCountMax = 20;
var checkStartup = 1;
var msgread = "buttonread";

var g_lang = "fr";  // par defaut

// EO DEBUG VALUES
/*var contentOption = 2;
var nbCountMax = 2;
var checkStartup = 1;
var msgread = "autoread"; // "buttonread";
*/

if(params[instanceName]) {
    if(params[instanceName].content) contentOption = params[instanceName].content;
    // if(params[instanceName].number) nbCountMax = params[instanceName].number;
    // if(params[instanceName].checkStartup) checkStartup = params[instanceName].checkStartup;
    if(params[instanceName].lang) g_lang = params[instanceName].lang;
    if(params[instanceName].msgread) msgread = params[instanceName].msgread;
}


log("contentOption : " + contentOption);
log("nbCountMax : " + nbCountMax);
log("checkStartup : " + checkStartup);
log("msgread : " + msgread);

var connected = false;
var lastTwitterId = new Array();

var oauth_token = "";
var oauth_token_secret = "";
var oauth_consumer_key = "";
var oauth_consumer_secret = "";

var loadTwitterId = function(){
	log("loadTwitterId");
	for(x in twitterDataName) {
		idName = twitterDataName[x];
		try {
			lastTwitterId[idName] = JSON.load(idName);
			log("lastTwitterId : " + x + "   value :" + lastTwitterId[idName]);
		}
		catch(e)
		{
		  log("no lastTwitterId! :" + x);
		}
	}
}

var saveTwitterId = function(idName, value){
 	log("saveTwitterId");
 	log("saveTwitterId idName:" + idName + "   value:" + value);
	lastTwitterId[idName] = "" + value;
	JSON.save(idName, lastTwitterId[idName]);
}

var checkConnected = function(callback){
	log("checkConnected connected : " + connected);
   	if(connected)
	{
        callback();
		return;
	}
    karotz.start(onKarotzStart, callback);
}

var onKarotzStart = function(callback){
    log("onKarotzStart");
    connected = true;
    karotz.button.addListener(buttonListener);
    mainColor();
    karotz.tts.start("Twitter", g_lang, function(event){
				    if(event != "OK"){
					    social.init(socialok, {});
					    return false;
				    }
                    return true;
			    }
    );
}

var socialok = function(){
    log("connected to Karotz");
    log( "launchType : " + launchType.name );
    log( "checkStartup : " + checkStartup );

    if(launchType.name == "SCHEDULER") startAutoRead();
    else if(checkStartup) checkConnected(startAutoRead);
    else checkConnected(nothingFunc);
}

var buttonListener = function(event)
{
    log("buttonListener : " + event);

    if(event == "LONG_START")
    {
        longClicEvent();
    }
    else if(event == "SIMPLE")
    {
        simpleClicEvent();
    }
    else if(event == "DOUBLE")
    {
        returnAndSave(); 
        exit();
    }
    return true;
}

var launch = function(res){
  log("asr cb")
  log(res.semantic)
  if (res.semantic == "timeline") { log("launchTimeline"); currentDataId = 2; startRead(); }
  else if (res.semantic == "mention") { log("mention"); currentDataId = 1; startRead(); }
  else if (res.semantic == "message") { log("message"); currentDataId = 0; startRead(); }
  else if (res.semantic == "newtweet") { log("newtweet"); postMessage(); }
  else if (res.semantic == "photo") { log("photo"); postMessageAndPhoto(); }
  else if (res.semantic == "audio") { log("audio"); takeSound(); }
  else if (res.semantic == "audio_photo") { log("audio_photo"); takeSoundAndPhoto(); }

  else mainColor()
}

//load previous oauth_token. 
var prev_oauth_token = "";
try {
	prev_oauth_token  = JSON.load("prev_oauth_token");
	log("prev_oauth_token : " + prev_oauth_token);
}
catch(e)
{
    log("prev_oauth_token! :");
}
//if false, delete all lastTwitterId
if(prev_oauth_token != oauth_token)
{
    for(x in twitterDataName) {
		idName = twitterDataName[x];
		JSON.save(idName, -1);
	}
}
//save oauth_token. 
JSON.save("prev_oauth_token", oauth_token);


loadTwitterId();

if(!launchType) var launchType = {};
log("launchType :" + launchType.name);

//social.twitter.sendMsg("test123");

karotz.connectAndStart(host, port, onKarotzStart, {} );
//social.init(socialok, {});

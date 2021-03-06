include("lib/util.js")
include("lib/tts2.js")
include("lib/i18n.js")
include("lib/karotz-chain.js")
include("lib/cleanToTts.js") 

include("lib/google.js")
include("lib/facebook.js")
include("lib/soundcloud.js")
include("lib/twitter.js")
include("lib/twitpic.js")
include("lib/led.js")

include("conf.js")
include(mainLang + ".js")

include("lib/state-machine.js")
include("social-fsm.js")

include("getMessage-fsm.js")
include("postMessage-fsm.js")
include("photo-fsm.js")
include("sound-fsm.js")
include("readFacebook-fsm.js")
include("readTwitter-fsm.js")

include("fsmGetMessage.js")
include("fsmPostMessage.js")
include("fsmPhoto.js")
include("fsmSound.js")
include("fsmFacebook.js")
include("fsmTwitter.js")
include("fsmSocial.js")


var useFacebook = true
var useTwitter = false
/*
log("params[instanceName].socialnetwork " +params[instanceName].socialnetwork)
if (params[instanceName].socialnetwork.indexOf("Facebook") >=0 ){
    useFacebook = true;
    log("useFacebook")
}
if (params[instanceName].socialnetwork.indexOf("Twitter") >=0 ){
    useTwitter = true;
    log("useTwitter")   
}
*/
//twitter params
var useTwitterDMsg = false
var useTwitterMention = false
var useTwitterTimeLine = false
/*
if(useTwitter) {
    if (params[instanceName].twitterconfig.indexOf("dMsg") >=0 ){
        useTwitterDMsg = true;
        log("useTwitterDMsg")
    }
    if (params[instanceName].twitterconfig.indexOf("mention") >=0 ){
        useTwitterMention = true;
        log("useTwitterMention")
    }
    if (params[instanceName].twitterconfig.indexOf("timeLine") >=0 ){
        useTwitterTimeLine = true;
        log("useTwitterTimeLine")
    }
}
*/

//facebookparams
var useFacebookDMsg = false
var useFacebookNotification = false
var useFacebookWall = false
var useFacebookStream = false
if(useFacebook) {
    /*
    if (params[instanceName].facebookconfig.indexOf("dMsg") >=0 ){
        useFacebookDMsg = true;
        log("useFacebookDMsg")
    }
    if (params[instanceName].facebookconfig.indexOf("notif") >=0 ){
        useFacebookNotification = true;
        log("useFacebookNotification")
    }
    if (params[instanceName].facebookconfig.indexOf("wall") >=0 ){
        useFacebookWall = true;
        log("useFacebookWall")
    }
    if (params[instanceName].facebookconfig.indexOf("stream") >=0 ){
        useFacebookStream = true;
        log("useFacebookStream")
    }
    */
    
    if(params[instanceName].dMsg == 1)
    {
        useFacebookDMsg = true;
        log("useFacebookDMsg")
    }
    if(params[instanceName].notif == 1)
    {
        useFacebookNotification = true;
        log("useFacebookNotification")
    }
    if(params[instanceName].stream == 1)
    {
        useFacebookStream = true;
        log("useFacebookStream")
    }
}

var langType = params[instanceName].langType

var readOrder = params[instanceName].order

var mAsRead = 0;
if(params[instanceName].mAsRead == "yes")
{
    mAsRead = 1;
}

var parentalControl = 0;


buttonListener = function(event){
    if (event == "DOUBLE") {
    log("###### double");
        quitSocial();   
    }
    if(event == "SIMPLE" ){
        if (fsm.can("simpleClick"))
            fsm.simpleClick();
        if (readFacebookFsm.can("simpleClick"))
            readFacebookFsm.simpleClick();
        if (readTwitterFsm.can("simpleClick"))
            readTwitterFsm.simpleClick();
        if (soundFsm.can("simpleClick"))
            soundFsm.simpleClick();
        if (getMessageFsm.can("simpleClick"))
            getMessageFsm.simpleClick();
            
    }
    if(event == "LONG_START" ){
        if (fsm.can("longClick"))
            fsm.longClick();
        if (readFacebookFsm.can("longClick"))
            readFacebookFsm.longClick();
        if (readTwitterFsm.can("longClick"))
            readTwitterFsm.longClick();
    }
    return true
};

var onKarotzConnect = function(data) {
    log("connected");
    karotz.button.addListener(buttonListener);
    
    log("######## test token facebook");
    try{
        name = social.facebook.getName()
        log("social.facebook.getName : " + name)
    }
    catch(e)
    {
        log("######## test token facebook : catch error");
        fsm.noToken()    
        return;
    }
                                      
    if(name.error_code)
    {
        log("name.error : " + name.error);
        fsm.noToken()    
        return;
    }                          
    else                
    {
        log("no error. account ok");
    }  
    
//    log("LaunchType " + JSON.stringify(launchType) );
    if (launchType.name == 'ASR'){
        var cmd = launchType.semantic.cmd
        if (cmd != 'none'){
            fsm.onWaitAction = function() {}//for best visual behaviour
            fsm.startupWait();
            fsm.onWaitAction = fsm.onExit // exit automaticaly after msg reading
            //key word "message twitter {$.cmd='readTwitter'} | message facebook {$.cmd='readFacebook'} |  photo facebook{$.cmd='takePhoto'} | sonore facebook{$.cmd='postSound'} | social {$.cmd='none'} "
            log("SEMANTIC CMD: " + cmd) 
            karotz.chain.play(__("audio.start"))
            .tts( __("facebook") , mainLang )
            .exec( function() { fsm[cmd](); } )  
        }
        else fsm.startup();
    }
    else if (launchType.name == 'SCHEDULER'){
        log("scheduled launch")
        fsm.onWaitAction = function() {}//for best visual behaviour
        fsm.startupWait();
        fsm.onWaitAction = fsm.onExit // exit automaticaly after msg reading
        //key word "message twitter {$.cmd='readTwitter'} | message facebook {$.cmd='readFacebook'} |  photo facebook{$.cmd='takePhoto'} | sonore facebook{$.cmd='postSound'} | social {$.cmd='none'} "
        fsm.readFacebookScheduler();
    }
    else{
        fsm.startup();
    } 
}

var quitSocial = function(){
    karotz.multimedia.stop();
    karotz.tts.stop();
                
    fsm.onWaitAction = fsm.onExit
    
    if (fsm.current === "WaitAction"){
        fsm.onExit()
    }
                        
    if (readFacebookFsm.can("stop"))
    {
        if (mAsRead == 1 && readFacebookFsm.can("mAsRead"))
            readFacebookFsm.mAsRead();
        else
            readFacebookFsm.stop();
    }
    if (readTwitterFsm.can("stop"))
        readTwitterFsm.stop();
    if (getMessageFsm.can("stop"))
        getMessageFsm.stop();
    if (soundFsm.can("stop"))
        soundFsm.stop();
    if (photoFsm.can("stop"))
        photoFsm.stop();    
    if (postMessageFsm.can("stop"))
        postMessageFsm.stop();  
                      
    if (fsm.can("next"))
        fsm.next();       
}

var error = function(url){
    /*if(!url)
        url = "http://soundcloud.com/karotz/phone-error/download";
    karotz.multimedia.play(url);*/
    led.work();
    karotz.chain.tts( __("asr.error") , mainLang )
    .exec( function() { fsm.error(); } )
}

fsm.onNoToken = function() {
    karotz.multimedia.stop();
    karotz.ears.reset();
    led.readTwitter();
    karotz.chain.play(__("audio.error"))
    .tts( __("message.error.facebook") , mainLang )
    .exec( function() { log("QUIT onNoToken"); exit(); } )
}

fsm.onReadHelpInit = function() {
    karotz.multimedia.stop();
    karotz.ears.reset();
    led.readFacebook();
    karotz.chain.play(__("audio.start"))
    .tts( __("help.initF") , mainLang )
    .exec( function() { if (fsm.current == "ReadHelpInit") fsm.next(); } )
}

fsm.onReadHelp = function() {
    karotz.multimedia.stop();
    karotz.ears.reset();
    led.readFacebook();
    karotz.chain.tts( __("help.1.F") , mainLang )
    .exec( function() { if (fsm.current == "ReadHelp") fsm.next(); } )
}

fsm.onWaitAction = function() {
    karotz.multimedia.stop();
    karotz.tts.stop();
    karotz.ears.reset();
    karotz.multimedia.play(__("audio.stop"));
    led.idle();
}

fsm.onAsrMain = function() {
    karotz.tts.stop();
    karotz.multimedia.stop();

    var grammar = __("asr.cmdHelp") + " {$='readHelp'} |"
    grammar += "(Facebook) " + __("asr.cmdRead") + " {$='readFacebook'} |"
    grammar += __("asr.cmdRead") + " (Facebook)" + " {$='readFacebook'} | "
    grammar += "(Facebook) " + __("asr.cmdPhoto") + " {$='takePhoto'} |"
    grammar += "(Facebook) " + __("asr.cmdSound") + " {$='postSound'} |"
    grammar += "(Facebook) " + __("asr.cmdMessage") + " {$='postMessage'} |"
    grammar += "(Facebook) " + __("asr.cmdMessagePhoto") + " {$='postMessagePhoto'} |" 
    grammar += __("asr.cmdRead") + " {$='readFacebook'} |"
    grammar += __("asr.cmdPhoto") + " {$='takePhoto'} |"
    grammar += __("asr.cmdSound") + " {$='postSound'} |"
    grammar += __("asr.cmdMessage") + " {$='postMessage'} |"
    grammar += __("asr.cmdMessagePhoto") + " {$='postMessagePhoto'}" 
    
    karotz.asr.string(grammar ,mainLang ,function(result){
        log("result.semantic:" + result.semantic);
        if(fsm[result.semantic]) {
            karotz.chain.play(__("audio.launchCmd"))
            .exec( function() { fsm[result.semantic](); } )
        }
        else{
            error();
        }
    })
    log("asr done");
};

karotz.connectAndStart(karotz_ip, 9123, onKarotzConnect, {});

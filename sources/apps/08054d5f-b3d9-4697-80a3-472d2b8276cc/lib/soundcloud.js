if (!social.soundcloud)
    social.soundcloud = {}

var connectionIDResponse;

var getConnectionID=function(connectionType)
{
    if(!connectionIDResponse)
    {
        url="https://api.soundcloud.com/me/connections.json";

        result = social.soundcloud.get(url);
        log("result get : " + result);
        
        if(result.length == 2){          
              log("error length == 2");    
              return 0;                
        }
          
        try {
            connectionIDResponse = JSON.parse(result);
        } catch (e) {
            log("error :" + e);
            return 0;
        }
    }

    for (var i =0; i< result.length; i++)
	{
        log("result type:" + connectionIDResponse[i].type);
        if(connectionIDResponse[i].type == connectionType)
        {
            return connectionIDResponse[i].id;
        }
    }
    return 0;
}

social.soundcloud.postSound = function(audio, title, photo){
    urlPost = "https://api.soundcloud.com/tracks.json";
    log("urlPost : " + urlPost) ;  

    if(!title)
    {
        title = "Karotz photo";
    }

    paramToPost = {
        "track[title]":title,
        "track[sharing]":"public",
        "track[downloadable]":"true"
    };

    if(audio)
    {
        paramToPost["track[asset_data]"] = audio;
    }
    if(photo)
    {
        paramToPost["track[artwork_data]"] = photo;
    }

    result = social.soundcloud.post(urlPost, paramToPost, {}, true);
    log("result : " + result);
    result = JSON.parse(result);

    //SHARE
    if(result.id == undefined)
    {
        log("result.id == undefined");
        return {};
    }

    var rtn = {};
    rtn.id = result.id;
    rtn.url = result.permalink_url;

    log("rtn.id : " + rtn.id);
    log("rtn.url : " + rtn.url);
    
    return rtn;
}

social.soundcloud.share = function(trackId, shareFacebook, shareTwitter, txtSharing){
    var paramToPost = {};
    var facebookConnectionID = 0;
    var twitterConnectionID = 0;
    rtn = 0;

    urlPost = "https://api.soundcloud.com/tracks/" + trackId + "/shared-to/connections";

    if(txtSharing)
    {
        paramToPost["sharing_note"] = txtSharing;
    }

    var header = {};
    //header["Authorization"] = "OAuth " + social.soundcloud.token;

    if(shareFacebook)
    {
        facebookConnectionID = getConnectionID("facebook_profile");
        log("result facebookConnectionID : " + facebookConnectionID);
        
        if(facebookConnectionID == 0)
        {
            log(" NOT OK. facebookConnectionID == 0");
            rtn--;
        }
        
        paramToPost["connections[][id]"] = facebookConnectionID;

        result = social.soundcloud.post(urlPost, paramToPost, {}, true);
        log("result " + result);

        //var connectionsRegExp=new RegExp( facebookConnectionID+ "</id>", "g");
        var connectionsRegExp=new RegExp( "<connections", "g");
        if(connectionsRegExp.test(result))
        {
            log("OK");
        }
        else
        {
            log(" NOT OK");
            rtn--;
        }
    }

    if(shareTwitter)
    {
        twitterConnectionID = getConnectionID("twitter");
        log("result twitterConnectionID : " + twitterConnectionID);
        paramToPost["connections[][id]"] = twitterConnectionID;

        result = social.soundcloud.post(urlPost, paramToPost, {}, true);
        log("result " + result);

        //var connectionsRegExp=new RegExp( twitterConnectionID+ "</id>", "g");
        var connectionsRegExp=new RegExp( "<connections", "g");
        if(connectionsRegExp.test(result))
        {
            log("OK");
        }
        else
        {
            log(" NOT OK");
            rtn--;
        }
    }
    return rtn;
}

var share_timeout = 500;
var share_countLoop = 0;

var share_trackId;
var share_shareFacebook;
var share_shareTwitter;
var share_txtSharing;
var share_callback;

var shareForceFunction = function()
{
    var rtn = social.soundcloud.share(share_trackId, share_shareFacebook, share_shareTwitter, share_txtSharing);
    if( rtn < 0 && share_countLoop < 6){  
        share_countLoop++;
        share_timeout += 1000;

        setTimeout(share_timeout,shareForceFunction);
    }
    else{
        log("avant share_callback "+share_callback)
        share_callback(rtn);
    }
    return false;
}

social.soundcloud.shareForce = function(trackId, shareFacebook, shareTwitter, txtSharing, callback){
    share_countLoop = 0;
    share_timeout = 1000;

    if(trackId == undefined) return false;

    share_trackId = trackId;
    share_shareFacebook = shareFacebook;
    share_shareTwitter = shareTwitter;
    share_txtSharing = txtSharing;
    share_callback = callback;

    setTimeout(share_timeout ,shareForceFunction);
}

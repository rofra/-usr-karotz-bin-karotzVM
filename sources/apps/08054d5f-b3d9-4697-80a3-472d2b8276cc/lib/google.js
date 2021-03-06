(function() {
  var exports, google;
  exports = this;
  google = {};
  google.asr = function(audio, lang) {
    var header, paramToPost, result;
    paramToPost = {
      "file": audio
    };
    header = {
      "Content-Type": "audio/x-flac; rate=16000"
    };
    result = http.post("http://www.google.com/speech-api/v1/recognize?lang=" + lang + "-" + lang + "&client=chromium", paramToPost, header, false);
    log("result : " + result);
    try {
      result = JSON.parse(result);
    } catch (e) {
      log("error " + e);
      return null;
    }
    log("result : " + result.hypotheses[0].utterance);
    return result.hypotheses[0].utterance;
  };
  google.getLang = function(txt) {
    var dataLang, dataLangJson, encodedTxt;
    dataLangJson = {};
    encodedTxt = encodeURIComponent(txt);
    dataLang = http.get("http://ajax.googleapis.com/ajax/services/language/detect?v=1.0&q=" + encodedTxt);
    try {
      dataLangJson = JSON.parse(dataLang);
    } catch (e) {
      log("error " + e);
      dataLangJson.responseData = null;
    }
    if (dataLangJson.responseData === null) {
      log("error : " + dataLangJson.responseDetails);
      return null;
    } else {
      log("currentTweet dataLangJson : " + dataLangJson.responseData.language);
      return dataLangJson.responseData.language;
    }
  };
  exports.google = google;
}).call(this);

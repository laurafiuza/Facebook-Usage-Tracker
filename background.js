var currentTimerState = "off";

// Listener to detect when Facebook page is accessed
// Checks currentTimerState variable to avoid adding new unnecessary timer
chrome.tabs.onActivated.addListener(
  function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
      console.log(tab.url);
      chrome.history.onVisited.addListener(
        function(result) {
          if (result.url.indexOf("facebook") > -1 && currentTimerState === "off") {
            console.log("History: Facebook was detected");
            startTimer();
          }
        }
      )
      if (tab.url.indexOf("facebook") > -1 && currentTimerState === "off") {
        console.log("Not History: Facebook was detected");
        startTimer();
      }
    });
  }
);

// Calls moment.js library to start timer
// I chose to use lastFocusedWindow instead of currentWindow
// because the latter is the window that only contains code that is
// currently executing, not the topmost window, like what we're looking for.
function startTimer() {
  var start = moment();
  var timer = setInterval(function() {
    var diff = moment().diff(start, 'seconds');
    chrome.tabs.query(
      {lastFocusedWindow: true, active: true},
      function(tab) {
        if (tab[0] != undefined && tab[0].url.indexOf("facebook") > -1) {
          if (diff % 10 === 0) {
            notifyUser(diff);
          }
        }
        else {
          clearInterval(timer);
          currentTimerState = "off";
          console.log("Facebook now undetected");
        }
      }
    )
  }, 1000);
  currentTimerState = "on";
}

// Uses rich notifications to alert the user about their Facebook usage
function notifyUser(diff) {
  var options = {
    "type": "basic",
    "title": "Facebook Usage",
    "message": "You have spent " + diff/60 + " minutes on Facebook.",
    "iconUrl": "icon.png"
  };
  var idBase = "facebookUsage";
  var id = idBase + (new Date()).getTime();
  chrome.notifications.create(id, options, function() {
    console.log(idBase + " created");
  });
}

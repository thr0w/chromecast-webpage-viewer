var namespace = "urn:x-cast:uk.co.ecksdee",
    loggerLevel = cast.receiver.LoggerLevel.ERROR,
    currentUrl = null,
    castReceiverManager = null,
    messageBus = null;

var $wrapper = $(".js-wrapper"),
    $iframe = $(".js-iframe");

window.onload = function() {
  cast.receiver.logger.setLevelValue(loggerLevel);
  castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
  console.log("Starting Receiver Manager");

  // handler for the 'ready' event
  castReceiverManager.onReady = function(event) {
    console.log("Received Ready event: ", event.data);
    castReceiverManager.setApplicationState("Application status is ready...");
  };

  // handler for 'senderconnected' event
  castReceiverManager.onSenderConnected = function(event) {
    console.log('Received Sender Connected event: ' + event.data);
    console.log(castReceiverManager.getSender(event.data).userAgent);
    messageBus.send(event.senderId, currentUrl || "Nothing");
  };

  // handler for 'senderdisconnected' event
  castReceiverManager.onSenderDisconnected = function(event) {
    console.log('Received Sender Disconnected event: ' + event.data);
  };

  // create a CastMessageBus to handle messages for a custom namespace
  messageBus = castReceiverManager.getCastMessageBus(namespace);

  // handler for the CastMessageBus message event
  messageBus.onMessage = function(event) {
    console.log("Message", event.senderId, event.data);
    // display the message from the sender
    displayUrl(event.data);
  }

  // initialize the CastReceiverManager with an application status message
  castReceiverManager.start({ statusText: "Application is starting" });
  console.log("Receiver Manager started");
};

// utility function to display the text message in the input field
function displayUrl(url) {
  currentUrl = addHttp(url);
  $iframe.attr("src", currentUrl);
  $wrapper.addClass("casting");
  castReceiverManager.setApplicationState("Displaying: " + currentUrl);
  // inform all senders on the CastMessageBus of the incoming message event
  // sender message listener will be invoked
  messageBus.broadcast(currentUrl);
}

function addHttp(url) {
  if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
    url = "http://" + url;
  }
  return url;
}

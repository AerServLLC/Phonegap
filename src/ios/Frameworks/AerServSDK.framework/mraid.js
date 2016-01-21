// mraid.js
//
// ALBERT ZHU | AerServ, LLC

// Logger Object
(function() {
 
 var logger = window.logger = {};
 
 logger.log = function(msg) {
     if(typeof msg === 'string') {
         var iframe = document.createElement("iframe");
         iframe.setAttribute("src", "aerserv.mraid://action-log/" + msg);
         document.documentElement.appendChild(iframe);
         iframe.parentNode.removeChild(iframe);
         iframe = null;
     }
 };
 }());

// CONSOLE LOGGER
(function() {
 
 var console = window.console = {};
 
 console.log = function(msg) {
     logger.log("console: " + msg);
 }
 
 }());

// Bridge Object
(function() {
 
 var mraidBridge = window.mraidBridge = {};
 
 // VARIABLES
 
 var bridgeConnectionBusy = false;
 var bridgeQueue = [];
 
 // METHODS
 
 mraidBridge.request = function(inUrl) {
     logger.log("bridge.request, inUrl: " + inUrl);
     var iframe = document.createElement("iframe");
     iframe.setAttribute("src", inUrl);
     document.documentElement.appendChild(iframe)
     iframe.parentNode.removeChild(iframe);
     iframe = null;
 };
 
 mraidBridge.connect = function(cmd) {
     var args;
     if(arguments !== undefined) {
         args = Array.prototype.slice.call(arguments);
         args.shift();
         logger.log("bridge.connect, cmd: " + cmd + " - argsArray: " + args.toString());
     } else {
         args = [];
     }
 
     // build url string
     var url = "aerserv.mraid://bridge-" + cmd + "/";
     
     // adding arguments string
     for(var i=0; i<args.length; i++) {
         url += "" + args[i].toString() + "|||";
     }
     if(url[url.length - 1] === '|' && url[url.length - 2] === '|' && url[url.length - 3] === '|') {
         url = url.substr(0, url.length-"|||".length);
     }
     logger.log("bridge.connect, url: " + url);
     
     // determine whether to send the request now or later
     logger.log("bridge.connect - BEFORE CHECKING IF BUSY, bridgeConnectionBusy: " + String(bridgeConnectionBusy));
     if(!bridgeConnectionBusy) {
         bridgeConnectionBusy = true;
         mraidBridge.request(url);
     } else {
         bridgeQueue.push(url);
         logger.log("bridge.connect, bridgeQueue: " + bridgeQueue.toString());
     }
     logger.log("bridge.connect - EXIT, bridgeConnectionBusy: " + String(bridgeConnectionBusy));
 };
 
 mraidBridge.finishConnection = function() {
     logger.log("bridge.finishConnection");
     if(bridgeQueue.length > 0) {
         var url = bridgeQueue.shift();
         mraidBridge.request(url);
     } else {
         bridgeConnectionBusy = false;
     }
     logger.log("bridge.finishConnection - EXIT, bidgeConnectionBusy: " + String(bridgeConnectionBusy));
 };
 
 }());

// MRAID Object
(function() {
 
 var mraid = window.mraid = {};
 
 // CONSTANTS
 
 var mraidVersion = "2.0";
 
 var kEVENTS = mraid.EVENTS = {
     "READY" : "ready",
     "ERROR" : "error",
     "STATECHANGE" : "stateChange",
     "VIEWABLECHANGE" : "viewableChange",
     "SIZECHANGE" : "sizeChange"
 };
 
 var kSTATES = mraid.STATES = {
     "LOADING" : "loading",
     "DEFAULT" : "default",
     "EXPANDED" : "expanded",
     "RESIZED" : "resized",
     "HIDDEN" : "hidden"
 };
 
 var kPLACEMENT = mraid.PLACEMENT = {
     "INLINE" : "inline",
     "INTERSTITIAL" : "interstitial"
 };

 var kCOMMANDS = mraid.COMMANDS = {
     "FINISHREADY" : "finishready",
     "OPEN" : "open",
     "EXPAND" : "expand",
     "EXPANDWITHURL" : "expandwithurl",
     "CLOSE" : "close",
     "RESTOREDEFAULT" : "restoredefault",
     "USECUSTOMCLOSE" : "usecustomclose",
     "RESIZE" : "resize",
     "FORCEORIENTATION" : "forceorientation",
     "STOREPICTURE" : "storepicture",
     "CREATECALENDAREVENT" : "createcalendarevent",
     "PLAYVIDEO" : "playvideo"
 };
 
 var kORIENTATIONPOSITIONS = mraid.ORIENTATIONPOSITIONS = {
     "PORTRAIT" : "portrait",
     "LANDSCAPE" : "landscape",
     "NONE" : "none"
 };
 
 var kCUSTOMCLOSEPOSITIONS = mraid.CUSTOMCLOSEPOSITIONS = {
     "TOPLEFT" : "top-left",
     "TOPRIGHT" : "top-right",
     "CENTER" : "center",
     "BOTTOMLEFT" : "bottom-left",
     "BOTTOMRIGHT" : "bottom-right",
     "TOPCENTER" : "top-center",
     "BOTTOMCENTER" : "bottom-center"
 };
 
 // PROPERTIES
 
 var mEXPANDPROPERTIES = mraid.EXPANDPROPERTIES = {
     "width" : 0,
     "height" : 0,
     "useCustomClose" : false,
     "isModal" : true
 };
 
 var mORIENTATIONPROPERTIES = mraid.ORIENTATIONPROPERTIES = {
     "allowOrientationChange" : true,
     "forceOrientation" : kORIENTATIONPOSITIONS.NONE
 };
 
 var mRESIZEPROPERTIES = mraid.RESIZEPROPERTIES = {
     "width" : undefined,
     "height" : undefined,
     "offsetX" : undefined,
     "offsetY" : undefined,
     "customClosePosition" : "top-right",
     "allowOffscreen" : false
 };
 
 var mCURRENTPOSITION = mraid.CURRENTPOSITION = {
     "x" : undefined,
     "y" : undefined,
     "width" : undefined,
     "height" : undefined
 };
 
 var mMAXSIZE = mraid.MAXSIZE = {
     "width" : undefined,
     "height" : undefined
 };
 
 var mDEFAULTPOSITION = mraid.DEFAULTPOSITION = {
     "x" : undefined,
     "y" : undefined,
     "width" : undefined,
     "height" : undefined
 };
 
 var mSCREENSIZE = mraid.SCREENSZIE = {
     "width" : undefined,
     "height" : undefined
 };
 
 var mSUPPORTS = mraid.SUPPORTSFEATURE = {
     "sms" : false,
     "tel" : false,
     "calendar" : false,
     "storePicture" : false,
     "inlineVideo" : false,
     "vpaid" : false
 };
 
 // VARIABLES
 
 var listeners = {};
 var mState = kSTATES.LOADING;
 var mPlacemnet = kPLACEMENT.INLINE;
 var mViewable = false;
 var mCustomClose = false;
 
 // HELPER METHODS
 
 mraid.respondsToEvent = function(event) {
     var eventArr = ["ready", "error", "stateChange", "viewableChange", "sizeChange"];
     for(var i=0; i<eventArr.length; i++) {
         if(event === eventArr[i]) {
             return true;
         }
     }
     return false;
 };
 
 mraid.error = function(msg, action) {
     logger.log("MRAID ERROR (" + action + "): " + msg);
 };
 
 // METHODS
 
 mraid.getVersion = function() {
     logger.log("getVersion");
     return mraidVersion;
 };
 
 // event listeners

 mraid.addEventListener = function(event, listener) {
     if(event === undefined || listener === undefined) {
         logger.log("addEventListener, event and/or listener are undefined");
         return;
     }
     if(!mraid.respondsToEvent(event)) {
         logger.log("addEventListener, " + event + " is not an accepted event");
         return;
     }
 
     var eventListeners = listeners[event] = listeners[event] || [];
 
     // checking if listener exists already
     for(var i=0; i<eventListeners.length; i++) {
         if(eventListeners[i] === listener || String(eventListeners[i]) === String(listener)) {
             logger.log("addEventListener, listener(" + String(listener) + ") already exists for event(" + event + ")");
             return;
         }
     }

     eventListeners.push(listener);
     logger.log("addEventListener, listener: " + String(listener) + " for event(" + event + "), eventListeners.length: " + String(eventListeners.length));
 };
 
 mraid.removeEventListener = function(event, listener) {
     if(event === undefined) {
         logger.log("removeEventListener, event and/or listener are undefined");
         return;
     }
 
     // get current list of event listeners for event
     var eventListeners = listeners[event];
     
     if(eventListeners === undefined || eventListeners.length === 0) {
         logger.log("removeEventListener, there are no more listeners to remove for event: " + String(event));
         listeners[event] = [];
         return;
     }
 
     // remove listener from current list
     if(listener !== undefined) {
         var i = eventListeners.indexOf(listener);
         if(i !== -1) {
             eventListeners.splice(i, 1);
             logger.log("removeEventListener, listener(" + String(listener) + ") for event(" + event + ") found at index(" + String(i) + ") and removed");
         } else {
             logger.log("removeEventListener, listener(" + String(listener) + ") for event(" + event + ") was not found");
         }
     } else {
         listeners[event] = [];
         logger.log("removeEventListener, all listeners for event(" + event + ") have been removed");
     }
 };
 
 mraid.handleEvent = function(event) {
     // get associated arguments for event
     var args = Array.prototype.slice.call(arguments);
     args.shift();
     logger.log("handleEvent(" + event + "), " + args.toString());
 
     // get current list of listeners for event
     var evListeners = listeners[event];
     if(evListeners) {
         var len = evListeners.length;
         logger.log("handleEvent, found " + len + " listeners");
         for(var i=0; i<len; i++) {
             logger.log("handleEvent, invoking evListeners[" + String(i) + "]: " + String(evListeners[i]));
             evListeners[i].apply(null, args);
             logger.log("handleEvent, handled.");
         }
     } else {
         logger.log("handleEvent, no event listeners found");
     }
 
     // if the event is ready, finish the ready event
     if(event === kEVENTS.READY) {
         mraidBridge.connect(kCOMMANDS.FINISHREADY);
     }
 };
 
 // states
 
 mraid.getState = function() {
     logger.log("getState = " + mState);
     return mState;
 };
 
 // sets the new state of the container and fires the state change event
 mraid.setState = function(stateEnum) {
     logger.log("setState = " + String(stateEnum));
 
     // translates the enum set via the mraidView class to the according state
     var newState = "";
     switch(stateEnum) {
         case 0:
             newState = kSTATES.LOADING;
             break;
         case 1:
             newState = kSTATES.DEFAULT;
             break;
         case 2:
             newState = kSTATES.EXPANDED;
             break;
         case 3:
             newState = kSTATES.RESIZED;
             break;
         case 4:
             newState = kSTATES.HIDDEN;
             break;
         default:
             newState = "N/A";
             break;
     }
 
 
    // fires eventlisteners that have been subscribed to the stateChange event
     if(mState !== newState && newState !== "N/A") {
         mState = newState;
         mraid.handleEvent(kEVENTS.STATECHANGE, mState);
     }
     mState = newState;
 };
 
 // placement
 
 mraid.getPlacementType = function() {
     logger.log("getPlacementType = " + mPlacemnet);
     return mPlacemnet;
 };
 
 mraid.setPlacementType = function(pTypeEnum) {
     logger.log("setPlacementType = " + pTypeEnum);
 
     // translates the enum set via the ASMRAIDView class to the according placement type
     var newPlc;
     switch(pTypeEnum) {
         case 0:
             newPlc = kPLACEMENT.INLINE;
             break;
         case 1:
             newPlc = kPLACEMENT.INTERSTITIAL;
             break;
         default:
             newPlc = "N/A";
             break;
     }
     
     if(mPlacemnet !== newPlc) {
         mPlacemnet = newPlc;
     }
 };
 
 // viewable
 
 mraid.isViewable = function() {
    logger.log("isViewable = " + mViewable);
    return mViewable;
 };
 
 mraid.setViewable = function(viewable) {
     logger.log("setViewable = " + String(viewable));
     var newView;
     if(viewable || viewable === "YES" || viewable === "true") {
         newView = true;
     } else {
         newView = false
     }
 
     if(newView !== mViewable) {
         logger.log("setViewable, newView = " + String(newView));
         mViewable = newView;
         mraid.handleEvent(kEVENTS.VIEWABLECHANGE, mViewable);
     }
 };
 
 // open
 
 mraid.open = function(url) {
     logger.log("open, url = " + url);
     mraidBridge.connect(kCOMMANDS.OPEN, [url]);
 };
 
 // expand
 
 mraid.getExpandProperties = function() {
     logger.log("getExpandProperties - expandProperties: " + JSON.stringify(mEXPANDPROPERTIES));
     return mEXPANDPROPERTIES;
 };
 
 mraid.getExpandPropertiesForBridge = function() {
     return JSON.stringify(mraid.getExpandProperties());
 };

 mraid.setExpandProperties = function(properties) {
     if(mState != kSTATES.EXPANDED) {
         logger.log("setExpandProperties - yet to be expanded");
 
         var propKeys = ["width", "height", "useCustomClose"];
         for(var i=0; i<propKeys.length; i++) {
             if(properties.hasOwnProperty(propKeys[i])) {
                 if(propKeys[i] === "width") {
                     if(!isNaN(properties.width)) {
                         //logger.log("setExpandProperties - width: " + String(properties.width));
                         mEXPANDPROPERTIES.width = properties.width;
                     } else {
                         logger.log("setExpandProperties - width isNaN");
                         return false;
                     }
                 } else if(propKeys[i] === "height") {
                     if(!isNaN(properties.height)) {
                         //logger.log("setExpandProperties - height: " + String(properties.height));
                         mEXPANDPROPERTIES.height = properties.height;
                     } else {
                         logger.log("setExpandProperties - height isNaN");
                         return false;
                     }
                 } else if(propKeys[i] === "useCustomClose") {
                     if(typeof properties.useCustomClose === "boolean") {
                         //logger.log("setExpandProperties - useCustomClose: " + String(properties.useCustomClose));
                         mEXPANDPROPERTIES.useCustomClose = properties.useCustomClose;
                         mCustomClose = properties.useCustomClose;
                     } else {
                         logger.log("setExpandProperties - useCustomClose is not a boolean");
                         return false;
                     }
                 }
             }
         }
         logger.log("setExpandProperties - finished setting values");
         return true;
     } else {
         logger.log("setExpandProperties - already expanded");
         return false;
     }
 };
 
 mraid.expand = function(url) {
     //check to see if the ad is expandable before expanding
     if(/*mPlacemnet === kPLACEMENT.INLINE && */(mState === kSTATES.DEFAULT || mState === kSTATES.RESIZED)) {
         if(url === undefined) {
             logger.log("expand, without url");
             mraidBridge.connect(kCOMMANDS.EXPAND);
         } else {
             logger.log("expand, url = " + url);
             mraidBridge.connect(kCOMMANDS.EXPANDWITHURL, url);
         }
     } else {
         logger.log("epxand not possible");
     }
 };
 
 // orientation
 
 mraid.getOrientationProperties = function() {
     logger.log("getOrientationProperties");
     return mORIENTATIONPROPERTIES;
 };
 
 mraid.getOrientationPropertiesForBridge = function() {
     return JSON.stringify(mraid.getOrientationProperties());
 };
 
 mraid.setOrientationProperties = function(properties) {
     var propKeys = ["allowOrientationChange", "forceOrientation"];
     for(var i=0; i<propKeys.length; i++) {
         if(properties.hasOwnProperty(propKeys[i])) {
             if(propKeys[i] === "allowOrientationChange") {
                 if(typeof properties.allowOrientationChange === "boolean") {
                    //logger.log("setOrientationProperties, allowOrientationChange: " + String(properties.allowOrientationChange));
                    mORIENTATIONPROPERTIES.allowOrientationChange = properties.allowOrientationChange;
                 } else {
                    logger.log("setOrientationProperties, allowOrientationChange is not a boolean");
                    return false;
                 }
             } else if (propKeys[i] === "forceOrientation") {
                 if(typeof properties.forceOrientation === "string" &&
                    (properties.forceOrientation === kORIENTATIONPOSITIONS.PORTRAIT ||
                    properties.forceOrientation === kORIENTATIONPOSITIONS.LANDSCAPE ||
                    properties.forceOrientation === kORIENTATIONPOSITIONS.NONE)) {
                     //logger.log("setOrientationProperties, forceOrientation: " + properties.forceOrientation);
                     mORIENTATIONPROPERTIES.forceOrientation = properties.forceOrientation;
                     mraidBridge.connect(kCOMMANDS.FORCEORIENTATION);
                 } else {
                     logger.log("setOrientationProperties, forceOrientation is not a valid orientation");
                     return false;
                 }
             }
         }
     }
     return true;
 };
 
 // close
 
 mraid.close = function() {
     if(mState === kSTATES.LOADING) return;
     
     if(mState === kSTATES.DEFAULT) {
         logger.log("close, default");
         mraidBridge.connect(kCOMMANDS.CLOSE);
     } else if(mState === kSTATES.EXPANDED || mState === kSTATES.RESIZED) {
         logger.log("close, expanded || resized = restore default");
         mraidBridge.connect(kCOMMANDS.RESTOREDEFAULT);
     }
 };
 
 mraid.useCustomClose = function(useCC) {
     if(mState === kSTATES.LOADING) return;
     
     if(typeof useCC === "boolean") {
         mCustomClose = useCC;
         mEXPANDPROPERTIES.useCustomClose = useCC;
         logger.log("useCustomClose - " + String(useCC));
     }
     mraidBridge.connect(kCOMMANDS.USECUSTOMCLOSE, String(mCustomClose));
 };
 
 // resize
 
 mraid.getResizeProperties = function() {
     return mRESIZEPROPERTIES;
 };
 
 mraid.getResizePropertiesForBridge = function() {
     return JSON.stringify(mraid.getResizeProperties());
 };
 
 mraid.setResizeProperties = function(properties) {
     var propKeys = ["width", "height", "offsetX", "offsetY", "customClosePosition", "allowOffscreen"];
     for(var i=0; i<propKeys.length; i++) {
         if(properties.hasOwnProperty(propKeys[i])) {
             if(propKeys[i] === "width") {
                 if(!isNaN(properties.width)) {
                     //logger.log("setResizeProperties, width: " + String(properties.width));
                     mRESIZEPROPERTIES.width = properties.width;
                 } else {
                     logger.log("setResizeProperties, width isNaN");
                     return false;
                 }
             } else if(propKeys[i] === "height") {
                 if(!isNaN(properties.height)) {
                     //logger.log("setResizeProperties, height: " + String(properties.height));
                     mRESIZEPROPERTIES.height = properties.height;
                 } else {
                     logger.log("setResizeProperties, height isNaN");
                     return false;
                 }
             } else if(propKeys[i] === "offsetX") {
                 if(!isNaN(properties.offsetX)) {
                     //logger.log("setResizeProperties, offsetX: " + String(properties.offsetX));
                     mRESIZEPROPERTIES.offsetX = properties.offsetX;
                 } else {
                     logger.log("setResizeProperties, offsetX isNaN");
                     return false;
                 }
             } else if(propKeys[i] === "offsetY") {
                 if(!isNaN(properties.offsetY)) {
                     //logger.log("setResizeProperties, offsetY: " + String(properties.offsetY));
                     mRESIZEPROPERTIES.offsetY = properties.offsetY;
                 } else {
                     logger.log("setResizeProperties, offsetY isNaN");
                     return false;
                 }
             } else if(propKeys[i] === "customClosePosition") {
                 if(typeof properties.customClosePosition === "string" &&
                    (properties.customClosePosition === kCUSTOMCLOSEPOSITIONS.TOPLEFT ||
                     properties.customClosePosition === kCUSTOMCLOSEPOSITIONS.TOPRIGHT ||
                     properties.customClosePosition === kCUSTOMCLOSEPOSITIONS.CENTER ||
                     properties.customClosePosition === kCUSTOMCLOSEPOSITIONS.BOTTOMLEFT ||
                     properties.customClosePosition === kCUSTOMCLOSEPOSITIONS.BOTTOMRIGHT ||
                     properties.customClosePosition === kCUSTOMCLOSEPOSITIONS.TOPCENTER ||
                     properties.customClosePosition === kCUSTOMCLOSEPOSITIONS.BOTTOMCENTER)) {
                     //logger.log("setResizeProperties, customClosePosition: " + properties.customClosePosition);
                     mRESIZEPROPERTIES.customClosePosition = properties.customClosePosition;
                 } else {
                     logger.log("setResizeProperties, customClosePosition is not valid");
                     return false;
                 }
             } else if(propKeys[i] === "allowOffscreen") {
                 if(typeof properties.allowOffscreen === "boolean") {
                     //logger.log("setResizeProperties, allowOffscreen: " + String(properties.allowOffscreen));
                     mRESIZEPROPERTIES.allowOffscreen = properties.allowOffscreen;
                 } else {
                     logger.log("setResizeProperties, allowOffscreen is not valid");
                     return false;
                 }
             }
         }
     }
     return true;
 };
 
 mraid.resize = function() {
     if(mState === kSTATES.EXPANDED) {
         mraid.handleEvent(kEVENTS.ERROR, "MRAID Ad is already in an expanded state, cannot be resized", "RESIZE");
     } else {
         mraidBridge.connect(kCOMMANDS.RESIZE);
     }
 };
 
 // current position
 
 mraid.getCurrentPosition = function() {
     return mCURRENTPOSITION;
 };
 
 mraid.getCurrentPositionForBridge = function () {
     return JSON.stringify(mraid.getCurrentPosition());
 };
 
 mraid.setCurrentPosition = function(properties) {
     var propKeys = ["x", "y", "width", "height"];
     for(var i=0; i<propKeys.length; i++) {
         if(properties.hasOwnProperty(propKeys[i])) {
             if(propKeys[i] === "width") {
                 if(!isNaN(properties.width)) {
                     //logger.log("setCurrentPosition, width: " + String(properties.width));
                     mCURRENTPOSITION.width = properties.width;
                 } else {
                     logger.log("setCurrentPosition, width isNaN");
                     return false;
                 }
             } else if(propKeys[i] === "height") {
                 if(!isNaN(properties.height)) {
                     //logger.log("setCurrentPosition, height: " + String(properties.height));
                     mCURRENTPOSITION.height = properties.height;
                 } else {
                     logger.log("setCurrentPosition, height isNaN");
                     return false;
                 }
             } else if(propKeys[i] === "x") {
                 if(!isNaN(properties.x)) {
                     //logger.log("setCurrentPosition, x: " + String(properties.x));
                     mCURRENTPOSITION.x = properties.x;
                 } else {
                     logger.log("setCurrentPosition, x isNaN");
                     return false;
                 }
             } else if(propKeys[i] === "y") {
                 if(!isNaN(properties.y)) {
                     //logger.log("setCurrentPosition, y: " + String(properties.y));
                     mCURRENTPOSITION.y = properties.y;
                 } else {
                     logger.log("setCurrentPosition, y isNaN");
                     return false;
                 }
             }
         }
     }
     return true;
 };
 
 // max size
 
 mraid.getMaxSize = function() {
     return mMAXSIZE;
 };
 
 mraid.getMaxSizeForBridge = function() {
     return JSON.stringify(mraid.getMaxSize());
 };
 
 mraid.setMaxSize = function(properties) {
     var propKeys = ["width", "height"];
     for(var i=0; i<propKeys.length; i++) {
         if(properties.hasOwnProperty(propKeys[i])) {
             if(propKeys[i] === "width") {
                 if(!isNaN(properties.width)) {
                     //logger.log("setMaxSize, width " + String(properties.width));
                     mMAXSIZE.width = properties.width;
                 } else {
                     logger.log("setMaxSize, width isNaN");
                     return false;
                 }
             } else if(propKeys[i] === "height") {
                 if(!isNaN(properties.height)) {
                     //logger.log("setMaxSize, height " + String(properties.height));
                     mMAXSIZE.height = properties.height;
                 } else {
                     logger.log("setMaxSize, height isNaN");
                     return false;
                 }
             }
         }
     }
     return true;
 };
 
 // default position
 
 mraid.getDefaultPosition = function() {
     return mDEFAULTPOSITION;
 };
 
 mraid.getDefaultPositionForBridge = function() {
     return JSON.stringify(mraid.getDefaultPosition());
 };
 
 mraid.setDefaultPosition = function(properties) {
     var propKeys = ["x", "y", "width", "height"];
     for(var i=0; i<propKeys.length; i++) {
         if(properties.hasOwnProperty(propKeys[i])) {
             if(propKeys[i] === "width") {
                 if(!isNaN(properties.width)) {
                     //logger.log("setDefaultPosition, width: " + String(properties.width));
                     mDEFAULTPOSITION.width = properties.width;
                 } else {
                     logger.log("setDefaultPosition, width isNaN");
                     return false;
                 }
             } else if(propKeys[i] === "height") {
                 if(!isNaN(properties.height)) {
                     //logger.log("setDefaultPosition, height: " + String(properties.height));
                     mDEFAULTPOSITION.height = properties.height;
                 } else {
                     logger.log("setDefaultPosition, height isNaN");
                     return false;
                 }
             } else if(propKeys[i] === "x") {
                 if(!isNaN(properties.x)) {
                     //logger.log("setDefaultPosition, x: " + String(properties.x));
                     mDEFAULTPOSITION.x = properties.x;
                 } else {
                     logger.log("setDefaultPosition, x isNaN");
                     return false;
                 }
             } else if(propKeys[i] === "y") {
                 if(!isNaN(properties.y)) {
                     //logger.log("setDefaultPosition, y: " + String(properties.y));
                     mDEFAULTPOSITION.y = properties.y;
                 } else {
                     logger.log("setDefaultPosition, y isNaN");
                     return false;
                 }
             }
         }
     }
     mraid.setCurrentPosition(properties);
     return true;
 };
 
 // screen size
 
 mraid.getScreenSize = function() {
     return mSCREENSIZE;
 };
 
 mraid.getScreenSizeForBridge = function() {
     return JSON.stringify(mraid.getScreenSize());
 };
 
 mraid.setScreenSize = function(properties) {
     var propKeys = ["width", "height"];
     for(var i=0; i<propKeys.length; i++) {
         if(properties.hasOwnProperty(propKeys[i])) {
             if(propKeys[i] === "width") {
                 if(!isNaN(properties.width)) {
                     //logger.log("setScreenSize, width: " + String(properties.width));
                     mSCREENSIZE.width = properties.width;
                 } else {
                     logger.log("setScreenSize, width isNaN");
                     return false;
                 }
             } else if(propKeys[i] === "height") {
                 if(!isNaN(properties.height)) {
                     //logger.log("setScreenSize, height: " + String(properties.height));
                     mSCREENSIZE.height = properties.height;
                 } else {
                     logger.log("setScreenSize, height isNaN");
                     return false;
                 }
             }
         }
     }
     return true;
 };
 
 // support features
 
 mraid.supports = function(feature) {
     logger.log("supports, " + feature + ": " + String(mSUPPORTS[feature]));
     return mSUPPORTS[feature];
 };
 
 mraid.setSupport = function(feature, supported) {
     if(typeof supported === "boolean" && mSUPPORTS.hasOwnProperty(feature)) {
     logger.log("setSupport, " + feature + ": " + String(supported));
         mSUPPORTS[feature] = supported;
     }
 };
 
 mraid.storePicture = function(URI) {
     logger.log("storePicture");
     mraidBridge.connect(kCOMMANDS.STOREPICTURE, URI);
 };
 
 mraid.createCalendarEvent = function(properties) {
     logger.log("createCalendarEvent, properties: " + JSON.stringify(properties));
     mraidBridge.connect(kCOMMANDS.CREATECALENDAREVENT, JSON.stringify(properties));
 };
 
 mraid.playVideo = function(url) {
     logger.log("playVideo");
     mraidBridge.connect(kCOMMANDS.PLAYVIDEO, url);
 };
 
}());
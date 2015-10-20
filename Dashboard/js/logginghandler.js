var LoggingHandler = {
    buffer:[],
    bufferSize: 10,
    overallLoggingCount:0,
    startTime: null,
    inactiveSince: null,
    //loggingEndpoint: 'http://{SERVER}/eexcess-privacy-proxy-1.0-SNAPSHOT/api/v1/log/moduleStatisticsCollected',
    visExt: undefined,
    
    init: function(visExt){
        LoggingHandler.browser = getBrowserInfo();
        LoggingHandler.visExt = visExt;
        LoggingHandler.startTime = new Date();
        
        $(window).bind('beforeunload', function(){
            LoggingHandler.log({ action: "Window is closing", source:"LoggingHandler" });
            LoggingHandler.sendBuffer();
            console.log('beforeunload');
        });
        $(window).blur(function(){
            LoggingHandler.inactiveSince = new Date();
            LoggingHandler.log({ action: "Focus lost", source:"LoggingHandler" });
            console.log('blur');
        });
        $(window).focus(function(){
            LoggingHandler.log({ action: "Focused", source:"LoggingHandler" });
            console.log('focus');
        });
    },
    
    log: function(logobject) {
        LoggingHandler.overallLoggingCount++;
        // Setting defaults:        
        var logDefaults = {};        
        logDefaults.seq = LoggingHandler.overallLoggingCount;
        logDefaults.uiState = {
            size : LoggingHandler.visExt.getScreenSize(), 
            actVis : LoggingHandler.visExt.getSelectedChartName(), 
            actFltrs : FilterHandler.activeFiltersNames,  
            browser: {name: LoggingHandler.browser.name, vers: LoggingHandler.browser.majorVersion}        
        };
        // Enhancing the object passed
        $.extend(logDefaults, logobject);
        LoggingHandler.buffer.push(logDefaults);
        
        console.log(logDefaults);        
        if (LoggingHandler.buffer.length > LoggingHandler.bufferSize)
            LoggingHandler.sendBuffer();
    },
    
    sendBuffer: function(){
        var logData = {
            "origin": {
                "clientType": "EEXCESS - ?? ",
                "clientVersion": "2.0",
                "module": "RecDashboard",
                "userID": "XX"
            },
            "content": LoggingHandler.buffer,
            "queryID": "XX" //A33B29B-BC67-426B-786D-322F85182DA6"
        };
        // calling centralized C4 logging API
        //api2.sendLog(api2.logInteractionType.moduleOpened, logData, function(event, jqXHR) { console.log(event); console.log(jqXHR); });
    }
};


var api2 = {
        logInteractionType: {
            moduleOpened: "moduleOpened",
            moduleClosed: "moduleClosed",
            moduleStatisticsCollected: "moduleStatisticsCollected",
            itemOpened: "itemOpened",
            itemClosed: "itemClosed",
            itemCitedAsImage: "itemCitedAsImage",
            itemCitedAsText: "itemCitedAsText",
            itemCitedAsHyperlink: "itemCitedAsHyperlink",
            itemRated: "itemRated"
        },
       settings : {
        base_url: "https://eexcess-dev.joanneum.at/eexcess-privacy-proxy-issuer-1.0-SNAPSHOT/issuer/",
        timeout: 10000,
        logTimeout: 5000,
        logggingLevel: 0,
        cacheSize: 10,
        suffix_recommend: 'recommend',
        suffix_details: 'getDetails',
        suffix_favicon: 'getPartnerFavIcon?partnerId=',
        suffix_log: 'log/',
        origin: {
            clientType: '',
            clientVersion: '',
            userID: ''
        }
    },
    originException: function(errorMsg) {
        this.toString = function() {
            return errorMsg;
        };
    },

    complementOrigin : function(origin) {
        if (typeof origin === 'undefined') {
            throw new api2.originException("origin undefined");
        } else if (typeof origin.module === 'undefined') {
            throw new api2.originException("origin.module undfined");
        } else if (typeof api2.settings.origin === 'undefined') {
            throw new api2.originException('origin undefined (need to initialize via APIconnector.init({origin:{clientType:"<name of client>", clientVersion:"version nr",userID:"<UUID>"}})');
        } else if (typeof api2.settings.origin.clientType === 'undefined') {
            throw new api2.originException('origin.clientType undefined (need to initialize via APIconnector.init({origin:{clientType:"<name of client>"}})');
        } else if (typeof api2.settings.origin.clientVersion === 'undefined') {
            throw new api2.originException('origin.clientVersion undefined (need to initialize via APIconnector.init({origin:{clientVersion:"<version nr>"}})');
        } else if (typeof api2.settings.origin.userID === 'undefined') {
            throw new api2.originException('origin.userID undefined (need to initialize via APIconnector.init({origin:{userID:"<UUID>"}})');
        } else {
            origin.clientType = api2.settings.origin.clientType;
            origin.clientVersion = api2.settings.origin.clientVersion;
            origin.userID = api2.settings.origin.userID;
        }
        return origin;
    },
  
    sendLog: function(interactionType, logEntry, callback) {
        logEntry.origin = api2.complementOrigin(logEntry.origin);
        var xhr;
        xhr = $.ajax({
            url: api2.settings.base_url + api2.settings.suffix_log + interactionType,
            data: JSON.stringify(logEntry),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            timeout: api2.settings.logTimeout,
            complete: function(event, jqXHR){
                if (callback)
                    callback(event, jqXHR);
            }
        });
    }  
};


var demo =
{
    action: "Brush created", //--> Mandatory
    source: "GeoVis",
    itemId: "",
    value: "",
    seq: 1,
    itemCountOld: 1,
    itemCountNew: 2,
    timestamp:'',
    uiState: {
        size: "123/123",
        browser: { name: "", vers: "" }, // will only be logged at the beginning
        vers: "11.a", //--> can be used for a/b testing 
        actVis: "Geo",
        actFltrs: ["Geo", "Time"],
        actBkmCol: "Demo Historic buildings", // if undefined, then "search result"
    }
}


// Example usages:
// LoggingHandler.log({ action: "Item opened", source:"List", itemId: "id of item",  });
// LoggingHandler.log({ action: "Item selected", source:"List", itemId: "id of item",  });
// LoggingHandler.log({ action: "Window Resized", value : "123/123" });
// LoggingHandler.log({ action: "Dashboard opened", uiState: { browser : { name: "", } } }); // + closed
// LoggingHandler.log({ action: "Bookmarked items", value : "Demo University campus", itemCountOld: "25", itemCountNew: "30" });
// LoggingHandler.log({ action: "Bookmarked item", value : "Demo University campus" itemId: "id of item" });
// LoggingHandler.log({ action: "Bookmark removed", value : "Demo University campus" itemId: "id of item" });
// LoggingHandler.log({ action: "Settings clicked"});
// LoggingHandler.log({ action: "Setting changed", value: "word-tagcloud --> landscape-tagcloud"});
// LoggingHandler.log({ action: "zoomed", source: "GeoVis"  });
// LoggingHandler.log({ action: "panned", source: "GeoVis"  });
// LoggingHandler.log({ action: "Collection changed", value: "Demo University campus"});
// LoggingHandler.log({ action: "Collection created", value: "Demo University campus" itemCountOld: "25", itemCountNew: "30"});
// LoggingHandler.log({ action: "Collection removed", value: "Demo University campus" itemCountOld: "25", itemCountNew: "30"});
// LoggingHandler.log({ action: "Collection exported", value: "Demo University campus" itemCountOld: "25", itemCountNew: "30"});
// LoggingHandler.log({ action: "Collection imported", value: "Demo University campus" itemCountOld: "25", itemCountNew: "30"});
// LoggingHandler.log({ action: "Brush created", source: "Timeline", value: "1980-2010", itemCountOld: "25", itemCountNew: "30"}); // source: "Barchart", value: "de" // source: "uRank", value: [{"keyword": "rome", weight: 15}, ...]
// LoggingHandler.log({ action: "Brush removed", source: "Barchart", widget="recycle bin|esc|...", itemCountOld: "25", itemCountNew: "30" }); 
// LoggingHandler.log({ action: "Filter set", source: "Barchart", value: "de", itemCountOld: "25", itemCountNew: "30" });
// LoggingHandler.log({ action: "Filter removed", source: "Barchart", value: "de", itemCountOld: "25", itemCountNew: "30" });
// LoggingHandler.log({ action: "ColorMapping changed", old: "language", new: "provider" source: "urank" });
// LoggingHandler.log({ action: "Chart changed", old: "language", new: "provider" });
// LoggingHandler.log({ action: "Reference added", itemId: "id of item" source: "urank" });
// LoggingHandler.log({ action: "Reset", source: "urank" });
// LoggingHandler.log({ action: "Scroll", source: "urank", value: "50px" }); // nice to have
// LoggingHandler.log({ action: "MouseArea changed", source: "urank", component:"tagcloud|list|bars|tagfilter", duration: "16" }); // only for duration > 1s // nice to have
// LoggingHandler.log({ action: "Item inspect", source: "urank|geo|landscape|time", itemId: "id of item"}); // only for duration > 1s // nice to have
// LoggingHandler.log({ action: "Keyword inspect", source: "landscape|uRank", value = "keyword1"}); // only for duration > 1s // nice to have
// LoggingHandler.log({ action: "Keyword added", source: "landscape|uRank", value = "keyword1"}); // click on keyword
// LoggingHandler.log({ action: "Keyword removed", source: "landscape|uRank", value = "keyword1"}); // click on keyword
// LoggingHandler.log({ action: "Filter saved|removed"});
// LoggingHandler.log({ action: "Filter collapsed|expanded by User"});

//Vis specific:
///uRank: rerank (#, #up, #down), weightChange(keyword, oldValue, newValue), keywordInspect(keyword) // >1s
// geo, timeline: imageSlider(source, action="slide|click"), arregationInspected (source, itemCount, type="donut|imageSlider") // >1s, nice to have

//????? IP bzw. User Identifizierung --> nicht nur session tracken, sondern auch den user

// // ev. interactiv-zeitraum...
// // wenn interactive nur wegen document open, dann nicht mitzählen
// // number of elements found
// // number of elements in collection
// // chart changed


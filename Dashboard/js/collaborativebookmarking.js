var CollaborativeBookmarkingAPI = {
    active: true,
    server: "http://ext250.know-center.tugraz.at/dashboard/visualization-widgets/collaborativebookmarking/bookmarks.php",
    get_key: "collection"



};

jQuery(document).ready(function () {
    jQuery('#share-collection-button').click(function () {
        CollaborativeBookmarkingAPI.storeCollection();
    });

    jQuery('#share-collection-close-button').click(function () {
        jQuery('#share-collection-link').hide();
    });
});


CollaborativeBookmarkingAPI.buildLink = function (id) {

    var location = window.parent.location.href;
    var regex = new RegExp("[?]?" + this.get_key + "=([^&]*)");
    location = location.replace(regex, "");
    location = location.replace("&&", "&");
    var delimiter = "?";
    if (location.indexOf("?") > 0)
        delimiter = "&";

    return location + delimiter + this.get_key + "=" + id;
};


CollaborativeBookmarkingAPI.copyLink = function () {
//    var link = document.querySelector('.js-emaillink');
//    var range = document.createRange();
//    range.selectNode(emailLink);
//    window.getSelection().addRange(range);
//
//    try {
//        // Now that we've selected the anchor text, execute the copy command  
//        var successful = document.execCommand('copy');
//        var msg = successful ? 'successful' : 'unsuccessful';
//        console.log('Copy email command was ' + msg);
//    } catch (err) {
//        console.log('Oops, unable to copy');
//    }
//
//    // Remove the selections - NOTE: Should use
//    // removeRange(range) when it is supported  
//    window.getSelection().removeAllRanges();
};

CollaborativeBookmarkingAPI.storeCollection = function () {

    var on_success = function (data) {

        jQuery('#share-collection-link span').html(this.buildLink(data.id));
        jQuery('#share-collection-link').show();
        console.log("Recevied message from cb-server", data);
    }.bind(this);


    var data = {
        collection: visTemplate.getData(),
        filters: FilterHandler.filters,
        query: globals["query"],
        profile: globals["profile"],
        query_id: globals["queryID"]
    };

    // Prevent error on stringifying a recursive loop...
    for (var f_count = 0; f_count < data.filters.length; f_count++) {
        var curr_f = data.filters[f_count];

        for (var f_data in curr_f.dataWithinFilter) {
            if (typeof curr_f.dataWithinFilter[f_data].geoMarker !== "undefined")
                curr_f.dataWithinFilter[f_data].geoMarker = null;
        }
    }



    var id = this.createId();
    jQuery.ajax(
        this.server,
        {
            method: "POST",
            data: {
                method: "storecollection",
                id: id,
                data: JSON.stringify(data)
            },
            dataType: 'json'
        }
    ).done(on_success)
        .error(function (data) {
            console.log("ERROR:", data);
        });

};


CollaborativeBookmarkingAPI.loadCollection = function (id, on_receive) {

    var on_success = function (response_data) {
        console.log(response_data);
        var data = response_data.data;

        on_receive(data);
    };

    jQuery.ajax(
        this.server,
        {
            method: "POST",
            data: {
                method: "getcollection",
                id: id
            },
            dataType: 'json'
        }
    ).done(on_success)
        .error(function (data) {
            console.log("ERROR:", data);
        });
    ;
};


CollaborativeBookmarkingAPI.getGetId = function () {

    var key = this.get_key;
    console.log(window.parent.location.search);

    var expr = new RegExp(key + "=([^&]*)");
    var ret = expr.exec(window.parent.location.search);
    if (ret === null)
        return false;

    var value = RegExp.$1;
    if (value && value.length)
        return value;
    return false;
};


CollaborativeBookmarkingAPI.createId = function () {
    var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var id = '';
    for (var i = 0; i < 15; i++) {
        var r = Math.floor(Math.random() * charSet.length);
        id += charSet.substring(r, r + 1);
    }
    return id;
};
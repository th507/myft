#!/usr/bin/env node
/*jshint node:true*/
var curl = require("curling");
var http = require('http');
/*
   caching: no time for this :(
    var fs = require('fs');

    if (!fs.existsSync(".cache") {
        fs.mkdirSync(".cache");
    }
    else if (!fs.existsSync(".cache/notifications")) {
        fs.mkdirSync(".cache/notifications");
    }
*/
var xAPIKey, xAPIHeader;
function set (key, header) {
    if (key && header) {
        xAPIKey = key;
        xAPIHeader = header;
    }
}
function requestHome(options, cb) {
    var url;
    options = options || {};
    if (options.url) {
        url = options.url;
        delete options.url;
    }
    else {
        url = options;
        options = {};
    }
    options.header = xAPIHeader;
    curl.connect().get(url, options, function(err, result) {
        if (err) {
            return;
        }
        cb.call(null, JSON.parse(result.payload), result.stats);
    });

}
function requestOne(options, cb) {
    var url;
    options = options || {};
    if (options.url) {
        url = options.url;
        delete options.url;
    }
    else {
        url = options;
        options = {};
    }
    options.header = xAPIHeader;
    curl.connect().get(url, options, function(err, result) {
        if (err) {
            return;
        }
        cb.call(null, JSON.parse(result.payload), result.stats);
    });
}
function requestMultiple(arr, cb) {
    var progress = 0, output = [],
        poorManResolve = function() {
            if (progress === arr.length) {
                cb.call(null, output);
            }
        };
    arr.forEach(function(item, index) {
        requestOne(item, function(response) {
            output[index] = response;
            progress = progress + 1;
            poorManResolve();
        });
    });
}

function search(query, aspect, cb) {
    aspect = aspect ? (aspect + "/") : "";
    curl.run('-d \''+JSON.stringify(query)+'\' "http://api.ft.com/content/search/'+aspect+'v1?apiKey='+xAPIKey+'"', function(err, result) {
        cb.call(null, JSON.parse(result.payload));
    });
}

module.exports =  {
        set     : set,
        home    : requestHome,
        single  : requestOne,
        multiple: requestMultiple,
        search  : search
};

#!/usr/bin/env node
var jsdom = require("jsdom").jsdom;

function strip(text) {
    if (!text.length) {
        return "";
    }
    text = "<html><body>" + text + "</body></html>";
    var document = jsdom(text);
    var window = document.createWindow();
    return window.document.body.textContent;
}

module.exports = strip;


#!/usr/bin/env node
/*jshint plusplus:false, node:true*/
var prompt = require("prompt");
var paint = require("./blockpaint.js");
var term = require("./clear.js");
var color = require("ansi-color").set;

function paginateText(text, height) {
    if (!text) {
        return [];
    }

    text = text.replace(/(’|‘)/g, "'");
    text = text.replace(/(“|”)/g, '"');
    text = text.replace(/–/g, "-");

    var width = term.width();

    // make it bigger than term.height
    // this is just another hack. Not a solution
    height = height || 10000;
    // TODO: this should be adaptive
    height = Math.min(height, term.height() - 5);

    var area = width * height;
    
    function padParagraph(str) {
        var arr = str.split("\n"), len, tmp = "";
        while (arr.length) {
            tmp += arr.shift();
            len = tmp.length;
            if (len) {
                var filledSpaces = (width - len % width) % width;
                
                tmp += new Array(filledSpaces).join(" ") + "\n";
            }
        }
        return tmp;
    }

    var output = [], tmp;

    tmp = padParagraph(text);
    while (tmp.length) {
        output.push(tmp.substr(0, area));
        tmp = tmp.substr(area);
    }
    return output;
}

function frontpageViewController(cb, arr, frontpage) {
    var schema = {
        properties: {
            "articles": {
                pattern: /^[\d]|r|R|q|Q+$/,
                message: 'Choose an article to read by entering its index number, entering q for quitting',
                required: true
            }
        }
    };

    // Start the prompt
    prompt.start();
    prompt.get(schema, function (err, result) {
        if (result.articles.toLowerCase() === "r") {
            console.log("Reloading content...");
            frontpage();
            return;
        }
        if (result.articles.toLowerCase() === "q") {
            console.log("Process ended");
            return process.exit(0);
        }

        if (cb) {
            var num = Number(result.articles) - 1;
            if (num >= 0 && num < arr.length) {
                term.clear();
                cb.call(null, num, arr);
            }
            else {
                console.log("No articles with index: " + result.articles + " is found.");
                frontpage();
            }
            return;
        }
    });
}


function displayPage(paginatedPages, pageIndex, title, frontpage, articlepage) {
    var logo = paint.block({column:{start:0, end:"max"}, row:{start:0, end:0}}, "Financial Times", "blue_bg");
    
    var i, len = paginatedPages.length;
    console.log(paint.line(0, [logo]));
    if (title) {
        console.log(paint.line(1, [title]));
    }
    
    if (len) {
        process.stdout.write(paginatedPages[pageIndex]);
        console.log(color("Page " + (pageIndex + 1) +" of " + len, "white_bg+black"));
        storyViewController(paginatedPages, pageIndex, title, frontpage, articlepage);
    }
    else {
        frontpage.call(null);
    }
}

function storyViewController(paginatedPages, pageIndex, title, frontpage, articlepage) {
    var schema = {
        properties: {
            "action": {
                pattern: /^(n|p|N|P|r|R|f|F|q|Q)$/,
                message: 'n for next page, p for previous, q for quitting',
                required: true
            }
        }
    };

    prompt.start();
    prompt.get(schema, function (err, result) {
        term.clear();
        if (result.action.toLowerCase() === "f") {
            return frontpage.call(null);
        }
        if (result.action.toLowerCase() === "q") {
            return process.exit(0);
        }
        if (result.action.toLowerCase() === "r") {
            return displayPage(paginatedPages, pageIndex, title, frontpage, articlepage);
        }

        var pages = paginatedPages.length - 1;
        var newPageIndex;
        if (result.action.toLowerCase() === "n") {
            newPageIndex = pageIndex + 1;
        }
        else if (result.action.toLowerCase() === "p") {
            newPageIndex = pageIndex - 1;
        }

        if (newPageIndex < 0 || newPageIndex > pages) {
            return frontpage.call(null);
        }
        return displayPage(paginatedPages, newPageIndex, title, frontpage, articlepage);
    });
}

module.exports = {
    frontpageViewController : frontpageViewController,
    storyViewController     : storyViewController,
    display                 : displayPage,
    paginate                : paginateText
};

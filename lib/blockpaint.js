#!/usr/bin/env node
/*jshint node:true, boss:true, plusplus:false*/
var term = require("./clear.js");
var color = require("ansi-color").set;

var blocklist = [];

function padText(text, num) {
    if (num <= 0) {
        return text;
    }
    var i = 0, arr = new Array(num + 1);
    while (i < num) {
        text += " ";
        i++;
    }
    return text;
    //return text += arr.join(" ");
}

function paintBlock(position, text, styles) {
    text = text.replace(/(’|‘)/g, "'");
    text = text.replace(/(“|”)/g, '"');
    text = text.replace(/–/g, "-");

    var column  = {},
        row     = {},
        content = [],
        output  = {},
        c, c_padded, r, len, res, arr, i, plaintext;

        column.start    = position.column.start || 0;
        column.end      = position.column.end;
        row.start	= position.row.start || 0;
        row.end		= position.row.end;
        if (row.end === "max") {
            row.end = term.height() - 2;
        }
        if (column.end === "max") {
            column.end = term.width();
        }
        if (column.end === "third") {
            column.end = Math.ceil(term.width() * 2 / 3);
        }
        if (column.start === "third") {
            column.start = Math.ceil(term.width() * 2 / 3);
        }
        if (column.end === "half") {
            column.end = Math.ceil(term.width() / 2);
        }
        if (column.start === "half") {
            column.start = Math.ceil(term.width() / 2);
        }
        if (row.end === "fit") {
            row.end = Math.ceil(text.length / (column.end - column.start - 2)) + row.start;
        }

            

    column.end  = Math.min(column.end, term.width());
    //row.end     = Math.min(row.end, term.height() - 2);


    c = column.end - column.start;
    r = row.end - row.start;
    
    if (c <= 0 || r < 0 || !text || !text.length) {
        return;
    }


    
    /* padding for text */
    c_padded = c - 2;
    if (res = text.length % c_padded) {
        text = padText(text, c_padded - res + 1);
    }
    
    i = 0;
    while (i <= r && text.length) {
        plaintext = text.substring(0, c_padded);
        content[row.start + i] = " " + plaintext + " ";
        text = text.substring(c_padded);
        i = i + 1;
    }

    output.row      = row;
    output.column   = column;
    output.styles   = styles || null;
    
    output.content  = content;

    return output;
}

function sortList(list) {
    return list.sort(function(a, b) {
        return a.row.end - b.row.end;
    });
}

function paintLine(row, list) {
    var output = {}, content = "", raw = "", color_len = 0;
    list.forEach(function(item, index, arr) {
        if (row <= item.row.end && row >= item.row.start) {
            // the reason I commented this code is that
            // the ansi-color will make text string longer
            // than what it appears to be. And currently I
            // do not have time to come up with something
            // elegant. So just be careful with width and
            // height.
            if (item.column.start > content.length - color_len) {
                content = padText(content, item.column.start - content.length + color_len);
            }
            if (item.column.start < content.length - color_len) {
                content = padText(content.substring(0, item.column.start) + color("", "black_bg"), item.column.start);
            }
            if (item.content[row]) {
                content += color(item.content[row], item.styles);
                raw += item.content[row];
                color_len = content.length - raw.length;
            }
            if (raw.length > term.width()) {
                content = content.substring(0, term.width() + color_len) + color("", "black_bg");
            }
            output.content = content;
            raw = "";
        }
    });
    return output.content;
}


function paintPage(list) {
    list = list.filter(function(item) {
        return !!item;
    });
    if (!list.length) {
        process.stdout.write("Reached last page.");
        return "";
    }
    term.clear();
    list = sortList(list);

    // leave some room for prompt and shell
    var page = [], i, len = term.height() - 2;
    for (i = 0; i < len; i ++) {
        page[i] = paintLine(i, list);
    }
    return page.join("\n");
}


module.exports = {
    block   : paintBlock,
    page    : paintPage,
    line    : paintLine
};

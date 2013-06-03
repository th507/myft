#!/usr/bin/env node

/*jshint node:true*/


module.exports.width = function() {
    return process.stdout.getWindowSize()[0];
}
module.exports.height = function() {
    return process.stdout.getWindowSize()[1];
}

// clear terminal output because we are about to do some quite intricate height calculations.
module.exports.clear = function() {
    return process.stdout.write('\u001B[2J\u001B[0;0f');
};

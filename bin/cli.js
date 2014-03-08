#!/usr/bin/env node
"use strict";

var cmdEmitter = require('../index.js').cli();

cmdEmitter.on('data', function (data) {
    if (typeof data === "object") {
        console.log(JSON.stringify(data));
    } else {
        console.log(data);
    }
});

cmdEmitter.on('error', function (error) {
    console.error(error);
});

cmdEmitter.on('end', function () {
    process.exit(0);
});

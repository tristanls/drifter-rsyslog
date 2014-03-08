/*

send.js: send command

The MIT License (MIT)

Copyright (c) 2014 Tristan Slominski

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";

var clie = require('clie');
var readline = require('readline');
var url = require('url');

var BACKOFF_DEFAULT_START = 500;        // TODO: parametrize
var BACKOFF_DEFAULT_MAX   = 1024000;    // TODO: parametrize

var send = module.exports = clie.command(function (args) {
    var self = this;
    if (args.length < 1) {
        return self.data(send.usage).end();
    }

    var dest = url.parse(args.shift());
    var transport;

    if (dest.protocol == 'https:') {
        transport = require('tls');
        dest.port = dest.port || 443;
    } else if (dest.protocol == 'http:') {
        transport = require('net');
        dest.port = dest.port || 80;
    } else {
        return self.data(send.usage).end();
    }

    var buffer = [];
    var terminate = false;
    var backoff = BACKOFF_DEFAULT_START;

    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on('line', function (line) {
        buffer.push(line);
    });
    rl.on('close', function () {
        terminate = true;
    });

    var connection;

    var connect = function connect() {
        connection = transport.connect(dest.port, dest.hostname);
        connection.setEncoding('utf8');

        if (dest.protocol == 'https:') {
            connection.on('secureConnect', sendMessages);
        } else {
            connection.on('connect', sendMessages);
        }

        connection.on('data', function (data) {
            self.data(data);
        });

        connection.on('error', function (error) {
            self.error(error);
            if (error.code == "ECONNREFUSED") {
                // implement exponential backoff
                if (backoff < BACKOFF_DEFAULT_MAX) {
                    backoff = backoff * 2;
                }
                if (!terminate || buffer.length > 0) {
                    setTimeout(connect, backoff);
                }
            }
        });

        connection.on('end', function () {
            // implement exponential backoff
            if (backoff < BACKOFF_DEFAULT_MAX) {
                backoff = backoff * 2;
            }
            if (!terminate || buffer.length > 0) {
                setTimeout(connect, backoff);
            }
        });
    };

    var sendMessages = function sendMessages() {
        // reset exponential backoff
        if (backoff > BACKOFF_DEFAULT_START) {
            backoff = BACKOFF_DEFAULT_START;
        }
        var message = buffer.shift();
        connection.write('GET /?' + encodeURIComponent(message) + ' HTTP/1.1\r\n');
        connection.write('Host: ' + dest.hostname + '\r\n');
        connection.write('\r\n');
        if (!terminate || buffer.length > 0) {
            setImmediate(sendMessages);
        } else {
            connection.end();
            self.end();
        }
    };

    connect();
});

send.usage = [
    "",
    "Usage: drifter-rsyslog send <destination>",
    "",
    "Turns message into drifter format and sends over HTTP(S) to the specified",
    "destination. Destination is a URI 'http(s)://<hostname>(:<port>)'.",
    ""
].join('\n');

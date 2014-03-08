/*

send.js: send command test

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

var drifter = require('../index.js');
var fs = require('fs');
var http = require('http');
var https = require('https');
var path = require('path');
var spawn = require('child_process').spawn;
var url = require('url');

var drifterPath = path.normalize(path.join(__dirname, '..', 'bin', 'cli.js'));

var test = module.exports = {};

test['send connects to http://localhost:8080'] = function (test) {
    test.expect(9);
    var message1 = 'message';
    var message2 = 'foo=bar&foo=car&something=17';
    var message3 = '{"blah":"blah again"}';
    var expected = [message1, message2, message3];
    var expectedIndex = 0;

    var server = http.createServer(function (req, res) {
        test.equal(req.method, 'GET');
        test.equal(req.headers.host, 'localhost');
        var reqUrl = url.parse(req.url);
        test.equal(decodeURIComponent(reqUrl.query), expected[expectedIndex]);
        expectedIndex++;
        res.writeHead(503);
        res.end();
        if (expectedIndex == 3) {
            server.close(function () {
                test.done();
            });
        }
    });
    server.listen(8080, function () {
        var drifterInstance =
            spawn('node', [drifterPath, 'send', 'http://localhost:8080']);
        drifterInstance.stdin.write(message1 + '\n');
        drifterInstance.stdin.write(message2 + '\n');
        drifterInstance.stdin.write(message3 + '\n');
        drifterInstance.stdin.end();
    });
};

test['send connects to https://localhost:4443'] = function (test) {
    test.expect(9);
    var message1 = 'message';
    var message2 = 'foo=bar&foo=car&something=17';
    var message3 = '{"blah":"blah again"}';
    var expected = [message1, message2, message3];
    var expectedIndex = 0;

    var options = {
        key: fs.readFileSync(path.normalize(path.join(__dirname, 'certs/server-key.pem'))),
        cert: fs.readFileSync(path.normalize(path.join(__dirname, 'certs/server-cert.pem')))
    };

    // allow self signed certs for testing
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    var server = https.createServer(options, function (req, res) {
        test.equal(req.method, 'GET');
        test.equal(req.headers.host, 'localhost');
        var reqUrl = url.parse(req.url);
        test.equal(decodeURIComponent(reqUrl.query), expected[expectedIndex]);
        expectedIndex++;
        res.writeHead(503);
        res.end();
        if (expectedIndex == 3) {
            server.close(function () {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = undefined;
                test.done();
            });
        }
    });
    server.listen(4443, function () {
        var drifterInstance =
            spawn('node', [drifterPath, 'send', 'https://localhost:4443']);
        drifterInstance.stdin.write(message1 + '\n');
        drifterInstance.stdin.write(message2 + '\n');
        drifterInstance.stdin.write(message3 + '\n');
        drifterInstance.stdin.end();
    });
};

# drifter-rsyslog

_Stability: 1 - [Experimental](https://github.com/tristanls/stability-index#stability-1---experimental)_

[![NPM version](https://badge.fury.io/js/drifter-rsyslog.png)](http://npmjs.org/package/drifter-rsyslog)

[Drifter](https://github.com/tristanls/drifter) output plugin for [rsyslog](http://www.rsyslog.com/).

## Overview

`drifter-rsyslog` is an [rsyslog](http://www.rsyslog.com/) output plugin. It encodes the message as a query string and issues an HTTP GET request to the specified destination.

  * [Usage](#usage)
  * [Tests](#tests)
  * [Documentation](#documentation)
  * [Sources](#sources)

## Usage

    npm install -g drifter-rsyslog

    /path/to/drifter-rsyslog send http://localhost:8080

## Tests

    npm test

## Documentation

  * [send](#send)

### send

Starts to listen for messages on `stdin`, transforms them into a query string, and sends them to the destination as an HTTP GET request.

```
Usage: drifter-rsyslog send <destination>

Turns message into drifter format and sends over HTTP(S) to the specified
destination. Destination is a URI 'http(s)://<hostname>(:<port>)'.
```

#### Event `data`

  * `function (data) {}`
    * `data`: _Buffer_ Data returned from the destination.

Emitted when the destination sends back data.

#### Event `end`

  * `function () {}`

Emitted when `stdin` is closed and all data was sent.

#### Event `error`

  * `function (error) {}`
    * `error`: _Object_ An error.
      * `code`: _String_ An error code. For example `ECONNREFUSED`.

Emitted when the connection to the destination encounters an error.

## Sources

  * [Writing RSysLog Plugins in 2 Minutes](http://www.rsyslog.com/writing-rsyslog-plugins-in-2-minutes/)

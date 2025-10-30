const path = require('path');

module.exports = {
    resolve: {
        fallback: {
            "stream": false,
            "fs": false,
            "path": false,
            "crypto": false,
            "url": false,
            "http": false,
            "https": false,
            "zlib": false,
            "net": false,
            "dns": false,
            "util": false,
            "os": false,
            "child_process": false,
            "tls": false
        }
    }
};






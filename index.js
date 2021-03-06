

var colors = require('colors'),
    httpServer = require('./lib/http-server'),
    argv = require('optimist').argv,
    portfinder = require('portfinder'),
    opener = require('opener');

if (argv.h || argv.help) {
  console.log([
    "usage: http-server [path] [options]",
    "",
    "options:",
    "  -p                 Port to use [8080]",
    "  -a                 Address to use [0.0.0.0]",
    "  -d                 Show directory listings [true]",
    "  -i                 Display autoIndex [true]",
    "  -e --ext           Default file extension if none supplied [none]",
    "  -s --silent        Suppress log messages from output",
    "  --cors             Enable CORS via the 'Access-Control-Allow-Origin' header",
    "  -o                 Open browser window after staring the server",
    "  -c                 Set cache time (in seconds). e.g. -c10 for 10 seconds.",
    "                     To disable caching, use -c-1.",
    "  -h --help          Print this list and exit."
  ].join('\n'));
  process.exit();
}

var port = argv.p || parseInt(process.env.PORT, 10),
    host = argv.a || '0.0.0.0',
    log = (argv.s || argv.silent) ? (function () {}) : console.log,
    requestLogger;

if (!argv.s && !argv.silent) {
  requestLogger = function(req) {
    log('[%s] "%s %s" "%s"', (new Date).toUTCString(), req.method.cyan, req.url.cyan, req.headers['user-agent']);
  }
}

if (!port) {
  portfinder.basePort = 8080;
  portfinder.getPort(function (err, port) {
    if (err) throw err;
    listen(port);
  });
} else {
  listen(port);
}

function listen(port) {
  var options = {
    root: argv._[0],
    cache: argv.c,
    showDir: argv.d,
    autoIndex: argv.i,
    ext: argv.e || argv.ext,
    logFn: requestLogger
  };

  if (argv.cors) {
    options.headers = { 'Access-Control-Allow-Origin': '*' };
  }

  var server = httpServer.createServer(options);
  server.listen(port, host, function() {
    log('Starting up http-server, serving '.yellow
      + server.root.cyan
      + ' on port: '.yellow
      + port.toString().cyan);
    log('Hit CTRL-C to stop the server');
    if (argv.o) {
      opener('http://127.0.0.1:' + port.toString());
    }
  });
}

if (process.platform !== 'win32') {
  //
  // Signal handlers don't work on Windows.
  //
  process.on('SIGINT', function () {
    log('http-server stopped.'.red);
    process.exit();
  });
}

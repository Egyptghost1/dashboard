const http = require('http');

function createServer(content, cache) {
  function handler(request, response) {
    if (request.url === '/favicon.ico') {
      response.end('');
      return;
    }

    const res = request.url.substring(1).split('/');
    if (res.length !== 2) {
      response.end('Not a valid URL');
      return;
    }

    const iceId = res[0];
    const className = res[1];

    let result = {
      '.expiresIn': 1,    // default cache TTL for cold lookup: 1s
    };

    // Hack, for internal beta users.
    if (className.startsWith('com.fitbit')) {
      content.send('ice-display', iceId,
        'JVM method auto-complete', className,
        'No extensions per privacy policy');
      result = {};
    } else if (cache.has(className)) {
      result = cache.get(className);
      content.send('ice-display', iceId,
        'JVM method auto-complete', className,
        result);
    } else {
      content.send('ice-lookup', iceId,
        'JVM method auto-complete', className);
    }
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(result));
  }

  return http.createServer(handler);
}

export default createServer;
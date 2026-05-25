const http = require('http');
const net = require('net');

const LISTEN_PORT = Number(process.env.FACADEFLOW_WEB_PROXY_PORT || 8081);
const WEB_TARGET_PORT = Number(process.env.FACADEFLOW_WEB_TARGET_PORT || 8082);
const API_TARGET_PORT = Number(process.env.FACADEFLOW_API_TARGET_PORT || 3000);
const HOST = process.env.FACADEFLOW_WEB_PROXY_HOST || '0.0.0.0';

const withLocalDevOrigin = (headers, targetPort) => {
  const nextHeaders = {
    ...headers,
    host: `127.0.0.1:${targetPort}`,
  };

  // Expo dev middleware rejects public Tailscale/proxy origins. Present
  // the matching local upstream origin to keep source maps and HMR stable.
  if (nextHeaders.origin) {
    nextHeaders.origin = `http://127.0.0.1:${targetPort}`;
  }

  return nextHeaders;
};

const ignoreReset = (error) => {
  if (error && ['ECONNRESET', 'EPIPE'].includes(error.code)) return;
  console.error('FacadeFlow web proxy socket error:', error);
};

const proxyRequest = (clientReq, clientRes, targetPort) => {
  clientReq.on('error', ignoreReset);
  clientRes.on('error', ignoreReset);

  const upstreamReq = http.request(
    {
      hostname: '127.0.0.1',
      port: targetPort,
      method: clientReq.method,
      path: clientReq.url,
      headers: withLocalDevOrigin(clientReq.headers, targetPort),
    },
    (upstreamRes) => {
      clientRes.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
      upstreamRes.pipe(clientRes).on('error', ignoreReset);
    }
  );

  upstreamReq.on('error', (error) => {
    if (!clientRes.headersSent) {
      clientRes.writeHead(502, { 'content-type': 'application/json' });
    }
    clientRes.end(JSON.stringify({
      error: 'Bad gateway',
      targetPort,
      detail: error.message,
    }));
  });

  clientReq.pipe(upstreamReq).on('error', ignoreReset);
};

const proxyUpgrade = (req, socket, head, targetPort) => {
  socket.on('error', ignoreReset);

  const upstreamSocket = net.connect(targetPort, '127.0.0.1', () => {
    upstreamSocket.on('error', ignoreReset);

    const headers = Object.entries(withLocalDevOrigin(req.headers, targetPort))
      .map(([key, value]) => `${key}: ${value}`)
      .join('\r\n');

    upstreamSocket.write(
      `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n${headers}\r\n\r\n`
    );

    if (head && head.length) {
      upstreamSocket.write(head);
    }

    socket.pipe(upstreamSocket).on('error', ignoreReset);
    upstreamSocket.pipe(socket).on('error', ignoreReset);
  });

  upstreamSocket.on('error', () => {
    socket.destroy();
  });
};

const server = http.createServer((req, res) => {
  const targetPort = req.url && req.url.startsWith('/api/') ? API_TARGET_PORT : WEB_TARGET_PORT;
  proxyRequest(req, res, targetPort);
});

server.on('upgrade', (req, socket, head) => {
  const targetPort = req.url && req.url.startsWith('/api/') ? API_TARGET_PORT : WEB_TARGET_PORT;
  proxyUpgrade(req, socket, head, targetPort);
});

server.listen(LISTEN_PORT, HOST, () => {
  console.log(
    `FacadeFlow web proxy listening on http://${HOST}:${LISTEN_PORT} -> web:${WEB_TARGET_PORT}, api:${API_TARGET_PORT}`
  );
});

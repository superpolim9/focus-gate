/**
 * Focus Gate — Tiny Local Workspace Server
 * Serves the Focus Gate workspace locally so YouTube embeds have a valid origin (no Error 153),
 * with zero configuration, full offline audio capability, and zero external dependencies.
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8899;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3':  'audio/mpeg',
  '.wav':  'audio/wav',
  '.ogg':  'audio/ogg',
  '.m4a':  'audio/mp4',
  '.flac': 'audio/flac',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Enable CORS and disable caching so workspace updates apply immediately
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://127.0.0.1:${PORT}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Health check / ping endpoint
  if (pathname === '/api/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', server: 'Focus Gate', port: PORT }));
    return;
  }

  // YouTube search proxy (defeats browser CORS restriction on localhost)
  if (pathname === '/api/yt-search') {
    const q = parsedUrl.searchParams.get('q') || '';
    if (!q) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing query' }));
      return;
    }
    const postData = JSON.stringify({
      context: { client: { clientName: 'WEB', clientVersion: '2.20241126.01.00', hl: 'en' } },
      query: q,
      params: 'EgIQAQ=='
    });
    const options = {
      hostname: 'www.youtube.com',
      port: 443,
      path: '/youtubei/v1/search?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&prettyPrint=false',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    };
    const ytReq = https.request(options, (ytRes) => {
      res.writeHead(ytRes.statusCode, { 'Content-Type': 'application/json' });
      ytRes.pipe(res);
    });
    ytReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    ytReq.write(postData);
    ytReq.end();
    return;
  }

  // YouTube oEmbed proxy
  if (pathname === '/api/yt-oembed') {
    const v = parsedUrl.searchParams.get('v') || '';
    if (!v) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing video ID' }));
      return;
    }
    const targetUrl = 'https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + v);
    https.get(targetUrl, (ytRes) => {
      res.writeHead(ytRes.statusCode, { 'Content-Type': 'application/json' });
      ytRes.pipe(res);
    }).on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // YouTube browse endpoint (playlists, channel tabs)
  if (pathname === '/api/yt-browse') {
    const id = parsedUrl.searchParams.get('id') || '';
    const params = parsedUrl.searchParams.get('params') || '';
    if (!id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing browse ID' }));
      return;
    }
    const body = {
      context: { client: { clientName: 'WEB', clientVersion: '2.20241126.01.00', hl: 'en' } },
      browseId: id
    };
    if (params) body.params = params;
    const postData = JSON.stringify(body);
    const options = {
      hostname: 'www.youtube.com',
      port: 443,
      path: '/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&prettyPrint=false',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    };
    const ytReq = https.request(options, (ytRes) => {
      res.writeHead(ytRes.statusCode, { 'Content-Type': 'application/json' });
      ytRes.pipe(res);
    });
    ytReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    ytReq.write(postData);
    ytReq.end();
    return;
  }

  // YouTube channel resolver endpoint
  if (pathname === '/api/yt-channel') {
    let q = (parsedUrl.searchParams.get('q') || '').trim();
    if (!q) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing channel query' }));
      return;
    }

    // Direct channel ID or URL detection
    const chUrlMatch = q.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/i);
    if (chUrlMatch) q = chUrlMatch[1];
    const handleUrlMatch = q.match(/youtube\.com\/(@[a-zA-Z0-9_.-]+)/i);
    if (handleUrlMatch) q = handleUrlMatch[1];

    if (/^UC[a-zA-Z0-9_-]{22}$/.test(q)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ channelId: q, title: '', handle: '', subscribers: '', thumbnail: '' }));
      return;
    }

    const postData = JSON.stringify({
      context: { client: { clientName: 'WEB', clientVersion: '2.20241126.01.00', hl: 'en' } },
      query: q
    });
    const options = {
      hostname: 'www.youtube.com',
      port: 443,
      path: '/youtubei/v1/search?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&prettyPrint=false',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    };
    const ytReq = https.request(options, (ytRes) => {
      let data = '';
      ytRes.on('data', c => data += c);
      ytRes.on('end', () => {
        try {
          const j = JSON.parse(data);
          let cr = null;
          function findCr(node) {
            if (!node || typeof node !== 'object') return;
            if (node.channelRenderer) { cr = node.channelRenderer; return; }
            if (Array.isArray(node)) {
              for (let i = 0; i < node.length; i++) { findCr(node[i]); if (cr) return; }
            } else {
              for (const k of Object.keys(node)) { findCr(node[k]); if (cr) return; }
            }
          }
          findCr(j);
          if (cr) {
            let thumb = cr.thumbnail?.thumbnails?.[0]?.url || '';
            if (thumb.startsWith('//')) thumb = 'https:' + thumb;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              channelId: cr.channelId,
              title: cr.title?.simpleText || '',
              handle: cr.subscriberCountText?.simpleText || '',
              subscribers: cr.videoCountText?.simpleText || '',
              thumbnail: thumb
            }));
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Channel not found' }));
          }
        } catch (e) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
    });
    ytReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    ytReq.write(postData);
    ytReq.end();
    return;
  }

  if (pathname === '/' || pathname === '') {
    pathname = '/Focus Gate.html';
  }

  // Prevent directory traversal
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT_DIR, safePath);

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('File not found: ' + pathname);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const totalSize = stats.size;

    // Handle HTTP Range requests (crucial for local audio playback seeking)
    const rangeHeader = req.headers.range;
    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : totalSize - 1;

        if (start >= totalSize || end >= totalSize) {
          res.writeHead(416, { 'Content-Range': `bytes */${totalSize}` });
          res.end();
          return;
        }

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': (end - start) + 1,
          'Content-Type': contentType
        });

        fs.createReadStream(filePath, { start, end }).pipe(res);
        return;
      }
    }

    res.writeHead(200, {
      'Content-Length': totalSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Focus Gate server running at http://127.0.0.1:${PORT}/`);
  console.log(`Ready for in-page YouTube playback without Error 153.`);
});

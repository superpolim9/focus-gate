"""
Focus Gate — Python Fallback Server
Serves Focus Gate locally so YouTube embeds work with a valid origin (no Error 153).
"""
import http.server
import socketserver
import os
import sys
import json
import urllib.request
from urllib.parse import urlparse, parse_qs

PORT = 8899
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class FocusGateHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range, Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path == '/' or self.path == '':
            self.path = '/Focus%20Gate.html'
        elif self.path == '/api/ping':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"ok","server":"Focus Gate (Python)"}')
            return
        elif self.path.startswith('/api/yt-search?'):
            qs = parse_qs(urlparse(self.path).query)
            q = qs.get('q', [''])[0]
            if not q:
                self.send_response(400)
                self.end_headers()
                return
            post_data = ('{"context":{"client":{"clientName":"WEB","clientVersion":"2.20241126.01.00","hl":"en"}},"query":' + json.dumps(q) + ',"params":"EgIQAQ=="}').encode('utf-8')
            req = urllib.request.Request(
                'https://www.youtube.com/youtubei/v1/search?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&prettyPrint=false',
                data=post_data,
                headers={'Content-Type': 'text/plain;charset=utf-8', 'User-Agent': 'Mozilla/5.0'}
            )
            try:
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = resp.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(data)
            except Exception as e:
                self.send_response(502)
                self.end_headers()
            return
        elif self.path.startswith('/api/yt-browse?'):
            qs = parse_qs(urlparse(self.path).query)
            bid = qs.get('id', [''])[0]
            params = qs.get('params', [''])[0]
            if not bid:
                self.send_response(400)
                self.end_headers()
                return
            bobj = {'context': {'client': {'clientName': 'WEB', 'clientVersion': '2.20241126.01.00', 'hl': 'en'}}, 'browseId': bid}
            if params:
                bobj['params'] = params
            post_data = json.dumps(bobj).encode('utf-8')
            req = urllib.request.Request(
                'https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&prettyPrint=false',
                data=post_data,
                headers={'Content-Type': 'text/plain;charset=utf-8', 'User-Agent': 'Mozilla/5.0'}
            )
            try:
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = resp.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(data)
            except Exception as e:
                self.send_response(502)
                self.end_headers()
            return
        elif self.path.startswith('/api/yt-channel?'):
            qs = parse_qs(urlparse(self.path).query)
            q = qs.get('q', [''])[0].strip()
            if not q:
                self.send_response(400)
                self.end_headers()
                return

            import re
            ch_match = re.search(r'youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})', q, re.I)
            if ch_match: q = ch_match.group(1)
            handle_match = re.search(r'youtube\.com\/(@[a-zA-Z0-9_.-]+)', q, re.I)
            if handle_match: q = handle_match.group(1)

            if re.match(r'^UC[a-zA-Z0-9_-]{22}$', q):
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'channelId': q, 'title': '', 'handle': '', 'subscribers': '', 'thumbnail': ''}).encode('utf-8'))
                return

            post_data = ('{"context":{"client":{"clientName":"WEB","clientVersion":"2.20241126.01.00","hl":"en"}},"query":' + json.dumps(q) + '}').encode('utf-8')
            req = urllib.request.Request(
                'https://www.youtube.com/youtubei/v1/search?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&prettyPrint=false',
                data=post_data,
                headers={'Content-Type': 'text/plain;charset=utf-8', 'User-Agent': 'Mozilla/5.0'}
            )
            try:
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = json.loads(resp.read().decode('utf-8', 'ignore'))
                    cr = None
                    def find_cr(node):
                        nonlocal cr
                        if not node or not isinstance(node, (dict, list)) or cr:
                            return
                        if isinstance(node, dict):
                            if 'channelRenderer' in node:
                                cr = node['channelRenderer']
                                return
                            for k in node:
                                find_cr(node[k])
                        elif isinstance(node, list):
                            for item in node:
                                find_cr(item)
                    find_cr(data)
                    if cr:
                        thumb = (((cr.get('thumbnail') or {}).get('thumbnails') or [{}])[0]).get('url', '')
                        if thumb.startswith('//'): thumb = 'https:' + thumb
                        res_obj = {
                            'channelId': cr.get('channelId', ''),
                            'title': (cr.get('title') or {}).get('simpleText', ''),
                            'handle': (cr.get('subscriberCountText') or {}).get('simpleText', ''),
                            'subscribers': (cr.get('videoCountText') or {}).get('simpleText', ''),
                            'thumbnail': thumb
                        }
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps(res_obj).encode('utf-8'))
                    else:
                        self.send_response(404)
                        self.end_headers()
            except Exception as e:
                self.send_response(502)
                self.end_headers()
            return
        elif self.path.startswith('/api/yt-oembed?'):
            qs = parse_qs(urlparse(self.path).query)
            v = qs.get('v', [''])[0]
            if not v:
                self.send_response(400)
                self.end_headers()
                return
            req = urllib.request.Request(
                'https://www.youtube.com/oembed?format=json&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D' + v,
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            try:
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = resp.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(data)
            except Exception as e:
                self.send_response(502)
                self.end_headers()
            return
        return super().do_GET()

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(('127.0.0.1', PORT), FocusGateHandler) as httpd:
            print(f"Focus Gate running at http://127.0.0.1:{PORT}/")
            httpd.serve_forever()
    except OSError as e:
        if e.errno == 98 or e.errno == 10048:
            print(f"Port {PORT} already in use. Focus Gate is likely already running.")
        else:
            raise

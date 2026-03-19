#!/usr/bin/env python3
"""
GrapplingMap Zapier Webhook Receiver

Run: python3 ~/Chat-gpt/tools/siri/zapier-receiver.py
Listens on port 8766.
Zapier POSTs {"prompt": "..."} to http://YOUR-MAC-IP:8766/prompt
Writes prompt to bridge.md for Code to pick up.

Use ngrok or tailscale to expose to internet if needed.
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
from datetime import datetime

BRIDGE_PATH = os.path.expanduser('~/GrapplingMap/bridge.md')
PORT = 8766


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/prompt':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body)
                prompt = data.get('prompt', body.decode())
            except Exception:
                prompt = body.decode()

            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            with open(BRIDGE_PATH, 'a') as f:
                f.write(f'\n---\n## INCOMING PROMPT \u2014 {timestamp}\n{prompt}\n---\n')

            print(f'[{timestamp}] Prompt received: {prompt[:60]}...')
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # suppress default logging


if __name__ == '__main__':
    print(f'GrapplingMap webhook receiver running on :{PORT}')
    print(f'Bridge: {BRIDGE_PATH}')
    print('POST /prompt with {{"prompt": "..."}} to write to bridge.md')
    HTTPServer(('0.0.0.0', PORT), Handler).serve_forever()

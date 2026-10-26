#!/bin/bash
set -euo pipefail

NYAGTAA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

python3 - "$NYAGTAA_ROOT" <<'PY'
import errno
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
import webbrowser

root = Path(sys.argv[1])
if not (root / 'index.html').is_file():
    raise SystemExit('Тоглоомын index.html файл олдсонгүй.')

class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

handler = partial(PreviewHandler, directory=str(root))
try:
    server = ThreadingHTTPServer(('127.0.0.1', 8000), handler)
except OSError as error:
    if error.errno != errno.EADDRINUSE:
        raise
    server = ThreadingHTTPServer(('127.0.0.1', 0), handler)

with server:
    url = f'http://127.0.0.1:{server.server_port}/'
    print(f'Тоглоом: {url}', flush=True)
    print('Дээд хэсгийн MN / EN товчоор хэлээ солиорой.', flush=True)
    print('Энэ цонхыг нээлттэй байлгана. Зогсоохдоо Ctrl + C дарна.', flush=True)
    try:
        if not webbrowser.open(url):
            print('Дээрх холбоосыг хөтөч дээрээ нээнэ үү.', flush=True)
    except webbrowser.Error:
        print('Дээрх холбоосыг хөтөч дээрээ нээнэ үү.', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nТоглоомын серверийг зогсоолоо.')
PY

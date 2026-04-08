#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 3000
DIRECTORY = "E:/playground/Plumber/client/dist"


class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Serve index.html for all routes (SPA support)
        if not os.path.exists(os.path.join(self.directory, self.path.lstrip("/"))):
            self.path = "/index.html"
        return http.server.SimpleHTTPRequestHandler.do_GET(self)


with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
    print(f"Serving SPA at http://localhost:{PORT}")
    httpd.serve_forever()

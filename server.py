import http.server
import socketserver

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        with open('iframe_dom.html', 'w', encoding='utf-8') as f:
            f.write(post_data)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'OK')

port = 8082
with socketserver.TCPServer(("", port), Handler) as httpd:
    print("serving at port", port)
    httpd.serve_forever()

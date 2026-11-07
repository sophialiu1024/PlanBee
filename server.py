import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from ai_client import plan_tasks


ROOT = Path(__file__).parent
PUBLIC = ROOT / "public"


class PlanBeeHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)

    def do_POST(self):
        if self.path != "/api/plan":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            tasks = payload.get("tasks", [])
            if not isinstance(tasks, list) or not tasks:
                raise ValueError("No tasks provided")
            answer = plan_tasks(tasks)
            self._send_json(200, {"answer": answer})
        except RuntimeError as error:
            if str(error) == "missing_key":
                self._send_json(503, {"error": "PlanBee could not find an OpenAI key. Please check your .env file."})
            else:
                self._send_json(503, {"error": "PlanBee could not reach the AI. Please check your key and internet connection."})
        except (ValueError, json.JSONDecodeError):
            self._send_json(400, {"error": "Please add at least one task with a due date."})

    def _send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        if self.path.startswith("/api/"):
            return
        super().log_message(format, *args)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8000), PlanBeeHandler)
    print("PlanBee is running at http://127.0.0.1:8000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

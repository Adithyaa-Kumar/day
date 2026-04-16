import os

from flask import Flask, send_from_directory
from pathlib import Path

app = Flask(__name__, static_folder='static', static_url_path='/static')
IMAGE_DIR = Path(app.root_path) / "image"


@app.route("/")
def index():
    return send_from_directory(app.root_path, "index.html")


@app.route("/image/<path:filename>")
def serve_image(filename):
    return send_from_directory(IMAGE_DIR, filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)

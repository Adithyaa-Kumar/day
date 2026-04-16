from flask import Flask, render_template, send_from_directory
from pathlib import Path

app = Flask(__name__)
IMAGE_DIR = Path(app.root_path) / "image"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/image/<path:filename>")
def serve_image(filename):
    return send_from_directory(IMAGE_DIR, filename)


if __name__ == "__main__":
    app.run(debug=True)

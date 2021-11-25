import os, sys
from flask import Flask, send_from_directory, jsonify

UPLOAD_FOLDER = os.path.abspath(os.path.dirname(sys.argv[0]))

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def tree_dir(startpath):
    paths = []
    for root, dirs, files in os.walk(startpath):
        _root = root.split("api")[1]
        paths.append((_root, dirs, files))
    return paths

@app.route("/files", methods=["GET"])
def list_files():
    files = tree_dir(app.config['UPLOAD_FOLDER'])
    
    response = jsonify(files)
    response.headers.add('Access-Control-Allow-Origin', "*") #в будущем заменить на https://wildrun0.dev
    
    return response

@app.route('/file/<path:file>', methods=["GET"])
def send_file(file):
    return send_from_directory(app.config["UPLOAD_FOLDER"], file, as_attachment=True)

if __name__ == "__main__":
    app.run(host="localhost", port=1337, debug=True)
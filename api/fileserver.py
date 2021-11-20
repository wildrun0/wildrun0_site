import os
from flask import Flask, send_from_directory, jsonify

UPLOAD_FOLDER = '.'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def tree_dir(startpath):
    paths = []
    for root, _, files in os.walk(startpath):
        folder = root.replace("\\", '/') #FUKCING WINDOWZ!!!!!!
        for file in files:
            paths.append(f"{folder}/{file}")
    return paths

@app.route("/files", methods=["GET"])
def list_files():
    files = tree_dir(app.config['UPLOAD_FOLDER'])
    
    response = jsonify(files)
    response.headers.add('Access-Control-Allow-Origin', "*") #в будущем заменить на https://wildrun0.dev
    
    return response

@app.route('/file/<path:file>')
def send_file(file):
    return send_from_directory(app.config["UPLOAD_FOLDER"], file, as_attachment=True)

if __name__ == "__main__":
    app.run(host="localhost", port=1337, debug=True)
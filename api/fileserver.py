import os
import sys
from datetime import datetime, timezone
from flask import Flask, send_from_directory, jsonify
from pathlib import Path

UPLOAD_FOLDER = os.path.abspath(os.path.dirname(sys.argv[0]))+"/files/"

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def sizeof_fmt(num, suffix="B"):
    for unit in ["", "Ki", "Mi", "Gi", "Ti", "Pi", "Ei", "Zi"]:
        if abs(num) < 1024.0:
            return f"{num:3.1f}{unit}{suffix}"
        num /= 1024.0
    return f"{num:.1f}Yi{suffix}"

tz = datetime.now(timezone.utc).astimezone().tzinfo #pc timezone
def get_advanced_files_info(_root, files):
    file_info = []
    for file in files:
        path = os.path.normpath(f"{app.config['UPLOAD_FOLDER'].replace('/files/', '')}{_root}/{file}")
        
        last_modified_ts = os.path.getmtime(path)
        last_modified_date = datetime.fromtimestamp(last_modified_ts, tz).strftime('%d.%m.%Y %H:%M:%S')
        
        root_directory = Path(path)
        if os.path.isdir(path):
            file_size = sizeof_fmt(sum(f.stat().st_size for f in root_directory.glob('**/*') if f.is_file()))
        else:
            file_size = sizeof_fmt(root_directory.stat().st_size)
        
        file_info.append([file, last_modified_date, file_size]) 
    return file_info

def tree_dir(startpath):
    paths = []
    for root, dirs, files in os.walk(startpath):
        _root = os.path.normpath(root.split("api")[1]).replace('\\','/')
        
        dirs_modified = get_advanced_files_info(_root, dirs)
        files_modified = get_advanced_files_info(_root, files)

        paths.append((_root, dirs_modified, files_modified))
    return paths

@app.route("/files", methods=["GET"])
def list_files():
    files = tree_dir(app.config['UPLOAD_FOLDER'])
    
    response = jsonify(files)
    response.headers.add('Access-Control-Allow-Origin', "*") #в будущем заменить на https://wildrun0.dev
    
    return response

@app.route('/files/<path:file>', methods=["GET"])
def send_file(file):
    return send_from_directory(app.config["UPLOAD_FOLDER"], file, as_attachment=True)

if __name__ == "__main__":
    app.run(host="192.168.0.101", port=1337, debug=True)
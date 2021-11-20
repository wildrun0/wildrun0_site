import os
from flask import Flask, send_from_directory, jsonify

UPLOAD_FOLDER = '.'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/files", methods=["GET"])
def list_files():
    file_list = []
    files = os.listdir(app.config["UPLOAD_FOLDER"])
    for file in files:
        # в теории можно сделать byteArray на второй аргумент чтобы через blob скачивать
        file_list.append((file, "http://localhost:1337/file/"+file))
        
    response = jsonify(file_list)
    response.headers.add('Access-Control-Allow-Origin', "*") #в будущем заменить на https://wildrun0.dev
    
    return response    
@app.route('/file/<filename>')
def send_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename, as_attachment=True)

if __name__ == "__main__":
    app.run(host="localhost", port=1337, debug=True)
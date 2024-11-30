from flask import Flask, request, jsonify
import os 
from flask_cors import CORS
from bot import process_audio 

app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "*"}})


# Route for processing audio files
@app.route('/process-audio/', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save the file temporarily
    file_path = os.path.join("temp", file.filename)
    file.save(file_path)

    # Process the file using the model
    result = process_audio(file_path)

    # Clean up the temporary file
    os.remove(file_path)

    return jsonify(result)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000)

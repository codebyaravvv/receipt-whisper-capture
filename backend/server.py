
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import numpy as np
from model.ocr_model import OCRModel
from model.trainer import ModelTrainer

app = Flask(__name__)
CORS(app)

# Initialize the OCR model
ocr_model = OCRModel()
trainer = ModelTrainer(ocr_model)

UPLOAD_FOLDER = 'uploads'
TRAINING_FOLDER = 'training_data'

# Ensure upload directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TRAINING_FOLDER, exist_ok=True)
os.makedirs(os.path.join(TRAINING_FOLDER, 'models'), exist_ok=True)

@app.route('/api/train', methods=['POST'])
def train_model():
    if 'training_files' not in request.files:
        return jsonify({'success': False, 'error': 'No files provided'}), 400
    
    files = request.files.getlist('training_files')
    name = request.form.get('name', 'default_model')
    description = request.form.get('description', '')
    
    # Save training files
    file_paths = []
    for file in files:
        if file.filename:
            file_path = os.path.join(TRAINING_FOLDER, file.filename)
            file.save(file_path)
            file_paths.append(file_path)
    
    if not file_paths:
        return jsonify({'success': False, 'error': 'No valid files provided'}), 400
    
    # Start training process (non-blocking)
    model_id = trainer.start_training_job(file_paths, name, description)
    
    return jsonify({
        'success': True,
        'modelName': name,
        'modelId': model_id
    })

@app.route('/api/models/<model_id>/status', methods=['GET'])
def get_model_status(model_id):
    status = trainer.get_training_status(model_id)
    return jsonify({'status': status})

@app.route('/api/models', methods=['GET'])
def get_models():
    models = trainer.list_models()
    return jsonify({'models': models})

@app.route('/api/extract', methods=['POST'])
def extract_data():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file provided'}), 400
    
    file = request.files['file']
    model_id = request.form.get('modelId', 'default')
    
    if file.filename == '':
        return jsonify({'success': False, 'error': 'Empty filename'}), 400
    
    # Save the uploaded file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    
    # Extract data using the selected model
    extracted_data = ocr_model.extract(file_path, model_id)
    
    # Clean up - remove the file after processing
    os.remove(file_path)
    
    return jsonify({
        'success': True,
        'extracted_data': extracted_data
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

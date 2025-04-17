
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import numpy as np
from model.ocr_model import OCRModel
from model.trainer import ModelTrainer
import traceback

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize the OCR model
print("Initializing OCR model...")
ocr_model = OCRModel()
trainer = ModelTrainer(ocr_model)
print("OCR model initialized")

UPLOAD_FOLDER = 'uploads'
TRAINING_FOLDER = 'training_data'

# Ensure upload directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TRAINING_FOLDER, exist_ok=True)
os.makedirs(os.path.join(TRAINING_FOLDER, 'models'), exist_ok=True)

@app.route('/api/train', methods=['POST'])
def train_model():
    try:
        print("Received training request")
        if 'training_files' not in request.files:
            print("No training files provided")
            return jsonify({'success': False, 'error': 'No files provided'}), 400
        
        files = request.files.getlist('training_files')
        print(f"Received {len(files)} training files")
        
        name = request.form.get('name', 'default_model')
        description = request.form.get('description', '')
        
        print(f"Model name: {name}, description: {description}")
        
        # Save training files
        file_paths = []
        for i, file in enumerate(files):
            if file.filename:
                file_path = os.path.join(TRAINING_FOLDER, file.filename)
                file.save(file_path)
                file_paths.append(file_path)
                print(f"Saved file {i+1}: {file.filename}")
        
        if not file_paths:
            print("No valid files provided")
            return jsonify({'success': False, 'error': 'No valid files provided'}), 400
        
        # Start training process (non-blocking)
        model_id = trainer.start_training_job(file_paths, name, description)
        print(f"Started training job with ID: {model_id}")
        
        return jsonify({
            'success': True,
            'modelName': name,
            'modelId': model_id
        })
    except Exception as e:
        print(f"Error during training: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/models/<model_id>/status', methods=['GET'])
def get_model_status(model_id):
    try:
        print(f"Checking status for model: {model_id}")
        status = trainer.get_training_status(model_id)
        print(f"Status for model {model_id}: {status}")
        return jsonify({'status': status})
    except Exception as e:
        print(f"Error checking model status: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/models', methods=['GET'])
def get_models():
    try:
        print("Listing available models")
        models = trainer.list_models()
        print(f"Found {len(models)} models")
        return jsonify({'models': models})
    except Exception as e:
        print(f"Error listing models: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/extract', methods=['POST'])
def extract_data():
    try:
        print("Received extraction request")
        if 'file' not in request.files:
            print("No file provided")
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        model_id = request.form.get('modelId', 'default')
        
        print(f"Extracting with model ID: {model_id}")
        
        if file.filename == '':
            print("Empty filename")
            return jsonify({'success': False, 'error': 'Empty filename'}), 400
        
        # Save the uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        print(f"Saved file: {file.filename}")
        
        # Extract data using the selected model
        extracted_data = ocr_model.extract(file_path, model_id)
        print(f"Extraction result: {extracted_data}")
        
        # Clean up - remove the file after processing
        os.remove(file_path)
        print(f"Removed temporary file: {file.filename}")
        
        return jsonify({
            'success': True,
            'extracted_data': extracted_data
        })
    except Exception as e:
        print(f"Error during extraction: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'OCR backend is running'})

if __name__ == '__main__':
    print("Starting OCR backend server on http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)

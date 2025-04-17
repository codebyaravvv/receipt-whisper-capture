
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import numpy as np
from model.ocr_model import OCRModel
from model.trainer import ModelTrainer
import traceback
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('ocr_backend')

app = Flask(__name__)

# More robust CORS configuration
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Initialize the OCR model
try:
    logger.info("Initializing OCR model...")
    ocr_model = OCRModel()
    trainer = ModelTrainer(ocr_model)
    logger.info("OCR model initialized successfully")
except Exception as e:
    logger.error(f"Error initializing OCR model: {str(e)}")
    logger.error(traceback.format_exc())
    # Still create instances to prevent app from crashing, but they will be in error state
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
    try:
        logger.info("Received training request")
        if 'training_files' not in request.files:
            logger.warning("No training files provided")
            return jsonify({'success': False, 'error': 'No files provided'}), 400
        
        files = request.files.getlist('training_files')
        logger.info(f"Received {len(files)} training files")
        
        name = request.form.get('name', 'default_model')
        description = request.form.get('description', '')
        
        logger.info(f"Model name: {name}, description: {description}")
        
        # Save training files
        file_paths = []
        for i, file in enumerate(files):
            if file.filename:
                file_path = os.path.join(TRAINING_FOLDER, file.filename)
                file.save(file_path)
                file_paths.append(file_path)
                logger.info(f"Saved file {i+1}: {file.filename}")
        
        if not file_paths:
            logger.warning("No valid files provided")
            return jsonify({'success': False, 'error': 'No valid files provided'}), 400
        
        # Start training process (non-blocking)
        model_id = trainer.start_training_job(file_paths, name, description)
        logger.info(f"Started training job with ID: {model_id}")
        
        return jsonify({
            'success': True,
            'modelName': name,
            'modelId': model_id
        })
    except Exception as e:
        logger.error(f"Error during training: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/models/<model_id>/status', methods=['GET'])
def get_model_status(model_id):
    try:
        logger.info(f"Checking status for model: {model_id}")
        status = trainer.get_training_status(model_id)
        logger.info(f"Status for model {model_id}: {status}")
        return jsonify({'status': status})
    except Exception as e:
        logger.error(f"Error checking model status: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/models', methods=['GET'])
def get_models():
    try:
        logger.info("Listing available models")
        models = trainer.list_models()
        logger.info(f"Found {len(models)} models")
        return jsonify({'models': models})
    except Exception as e:
        logger.error(f"Error listing models: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/extract', methods=['POST'])
def extract_data():
    try:
        logger.info("Received extraction request")
        if 'file' not in request.files:
            logger.warning("No file provided")
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        model_id = request.form.get('modelId', 'default')
        
        logger.info(f"Extracting with model ID: {model_id}")
        
        if file.filename == '':
            logger.warning("Empty filename")
            return jsonify({'success': False, 'error': 'Empty filename'}), 400
        
        # Save the uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        logger.info(f"Saved file: {file.filename}")
        
        # Extract data using the selected model
        extracted_data = ocr_model.extract(file_path, model_id)
        logger.info(f"Extraction result: {extracted_data}")
        
        # Clean up - remove the file after processing
        os.remove(file_path)
        logger.info(f"Removed temporary file: {file.filename}")
        
        return jsonify({
            'success': True,
            'extracted_data': extracted_data
        })
    except Exception as e:
        logger.error(f"Error during extraction: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'OCR backend is running'})

# Add a preflight route for better CORS handling
@app.route('/api/health', methods=['OPTIONS'])
def health_check_preflight():
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    return response

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    logger.info(f"Starting OCR backend server on http://{host}:{port}")
    try:
        app.run(host=host, port=port, debug=debug)
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        logger.error(traceback.format_exc())

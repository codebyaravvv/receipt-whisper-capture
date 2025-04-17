
import os
import uuid
import threading
import time
import json
from datetime import datetime
import cv2
import numpy as np
from .ocr_model import OCRModel

class ModelTrainer:
    def __init__(self, ocr_model):
        self.ocr_model = ocr_model
        self.training_jobs = {}
        self.model_dir = os.path.join('training_data', 'models')
        self.models_store = os.path.join('training_data', 'models.json')
        self._load_models_store()
    
    def _load_models_store(self):
        """Load the models metadata store"""
        if os.path.exists(self.models_store):
            try:
                with open(self.models_store, 'r') as f:
                    self.models_metadata = json.load(f)
            except:
                self.models_metadata = []
        else:
            self.models_metadata = []
    
    def _save_models_store(self):
        """Save the models metadata store"""
        with open(self.models_store, 'w') as f:
            json.dump(self.models_metadata, f)
    
    def start_training_job(self, file_paths, name, description):
        """Start a new training job in a background thread"""
        model_id = str(uuid.uuid4())
        
        # Add model to metadata
        model_metadata = {
            'id': model_id,
            'name': name,
            'description': description,
            'createdAt': datetime.now().isoformat(),
            'status': 'training'
        }
        self.models_metadata.append(model_metadata)
        self._save_models_store()
        
        # Start training in background thread
        self.training_jobs[model_id] = {
            'status': 'training',
            'thread': threading.Thread(
                target=self._train_model_thread,
                args=(model_id, file_paths, name, description)
            )
        }
        self.training_jobs[model_id]['thread'].start()
        
        return model_id
    
    def _train_model_thread(self, model_id, file_paths, name, description):
        """Background thread for model training"""
        try:
            # Create training data from files
            X_train, y_train = self._prepare_training_data(file_paths)
            
            # Build model
            model = self.ocr_model.build_model()
            
            # Create field mappings based on analysis of training files
            fields = self._analyze_fields(file_paths)
            
            # Configure the model
            config = {
                'name': name,
                'description': description,
                'fields': fields,
                'created_at': datetime.now().isoformat()
            }
            
            # Train the model 
            # In a real implementation, this would use the X_train and y_train data
            # We're simplifying here for demonstration
            # model.fit(X_train, y_train, epochs=10, batch_size=16, validation_split=0.2)
            
            # Simulate training time
            time.sleep(20)  # Simulate 20 seconds of training
            
            # Save the model
            self.ocr_model.save_model(model, model_id, config)
            
            # Update status
            self._update_model_status(model_id, 'ready')
            self.training_jobs[model_id]['status'] = 'ready'
            
        except Exception as e:
            print(f"Training error: {str(e)}")
            self._update_model_status(model_id, 'failed')
            self.training_jobs[model_id]['status'] = 'failed'
    
    def _prepare_training_data(self, file_paths):
        """Prepare training data from the provided files"""
        # In a real implementation, this would extract features and labels from the training files
        # For this demonstration, we'll return placeholder data
        
        # Create placeholder training data
        num_samples = len(file_paths)
        X_train = np.random.random((num_samples, 800, 800, 3))
        y_train = np.random.random((num_samples, 100, 128))  # Simplified output shape
        
        return X_train, y_train
    
    def _analyze_fields(self, file_paths):
        """Analyze training files to determine fields"""
        # In a real implementation, this would analyze the documents to identify fields
        # For this demonstration, we'll return placeholder fields
        return ['invoice_number', 'date', 'total_amount', 'vendor', 'due_date']
    
    def _update_model_status(self, model_id, status):
        """Update the status of a model in the metadata store"""
        for model in self.models_metadata:
            if model['id'] == model_id:
                model['status'] = status
                break
        self._save_models_store()
    
    def get_training_status(self, model_id):
        """Get the status of a training job"""
        if model_id in self.training_jobs:
            return self.training_jobs[model_id]['status']
        
        # Check in metadata if job is no longer in memory
        for model in self.models_metadata:
            if model['id'] == model_id:
                return model['status']
        
        return 'unknown'
    
    def list_models(self):
        """List all available models"""
        return self.models_metadata

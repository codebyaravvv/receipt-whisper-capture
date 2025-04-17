
import os
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model, Model
from tensorflow.keras.layers import Input, Conv2D, MaxPooling2D, Reshape, Dense, Dropout, LSTM, Bidirectional
from tensorflow.keras.applications import VGG16
import matplotlib.pyplot as plt
from PIL import Image
import json

class OCRModel:
    def __init__(self):
        self.models = {}
        self.model_dir = os.path.join('training_data', 'models')
        self._load_existing_models()
    
    def _load_existing_models(self):
        """Load all existing trained models from the models directory"""
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)
            return
        
        for model_name in os.listdir(self.model_dir):
            if os.path.isdir(os.path.join(self.model_dir, model_name)):
                try:
                    model_path = os.path.join(self.model_dir, model_name, 'model.h5')
                    config_path = os.path.join(self.model_dir, model_name, 'config.json')
                    
                    if os.path.exists(model_path) and os.path.exists(config_path):
                        self.models[model_name] = {
                            'model': load_model(model_path),
                            'config': json.load(open(config_path, 'r'))
                        }
                except Exception as e:
                    print(f"Failed to load model {model_name}: {str(e)}")
    
    def build_model(self, input_shape=(800, 800, 3), output_classes=128):
        """Build a CNN+RNN model for OCR"""
        # Input layer
        input_img = Input(shape=input_shape)
        
        # CNN Feature Extraction - Using transfer learning with VGG16
        base_model = VGG16(weights='imagenet', include_top=False, input_tensor=input_img)
        
        # Freeze early layers
        for layer in base_model.layers[:15]:
            layer.trainable = False
        
        # Add custom layers for OCR
        x = base_model.output
        x = Conv2D(512, (3, 3), activation='relu', padding='same')(x)
        x = MaxPooling2D(pool_size=(2, 2))(x)
        x = Dropout(0.25)(x)
        
        # Reshape for sequence processing
        _, h, w, c = x.shape
        x = Reshape((w, h * c))(x)
        
        # RNN for sequence modeling
        x = Bidirectional(LSTM(256, return_sequences=True))(x)
        x = Bidirectional(LSTM(128, return_sequences=True))(x)
        
        # Output layer
        outputs = Dense(output_classes, activation='softmax')(x)
        
        # Create model
        model = Model(inputs=input_img, outputs=outputs)
        model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
        
        return model
    
    def preprocess_image(self, image_path):
        """Preprocess image for model input"""
        # Read and resize image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image: {image_path}")
        
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (800, 800))
        
        # Normalize pixel values
        img = img.astype(np.float32) / 255.0
        
        return img
    
    def extract(self, image_path, model_id):
        """Extract text from an image using the specified model"""
        if model_id not in self.models:
            return {"error": f"Model {model_id} not found"}
        
        try:
            # Preprocess image
            img = self.preprocess_image(image_path)
            
            # Get prediction
            model_data = self.models[model_id]
            model = model_data['model']
            config = model_data['config']
            
            # For demonstration, we'll return structured data
            # In a real implementation, this would use the model to extract text and then structure it
            
            # Simulate extraction with basic image analysis 
            # (In a real implementation, this would use the model's predictions)
            
            # For demo purposes - detect regions and extract sample data
            # In real implementation, you would use the model's output to structure the data
            extracted = self._simulate_extraction(img, config)
            
            return extracted
        except Exception as e:
            return {"error": str(e)}
    
    def _simulate_extraction(self, img, config):
        """
        Simulate extraction for demonstration purposes
        In a real implementation, this would use actual model predictions
        """
        # Convert back to uint8 for OpenCV operations
        img_cv = (img * 255).astype(np.uint8)
        gray = cv2.cvtColor(img_cv, cv2.COLOR_RGB2GRAY)
        
        # Find text-like regions (this is a simplified approach)
        # In a real implementation, you would use the model predictions
        _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Extract sample fields
        # In a real model, these would be determined by the trained model
        fields = config.get('fields', ['invoice_number', 'date', 'total_amount', 'vendor'])
        extracted = {}
        
        # Assign placeholder values (in a real implementation, these would come from model predictions)
        for field in fields:
            extracted[field] = f"Sample {field.replace('_', ' ').title()}"
        
        return extracted
    
    def save_model(self, model, model_id, config):
        """Save a trained model"""
        model_path = os.path.join(self.model_dir, model_id)
        os.makedirs(model_path, exist_ok=True)
        
        # Save model weights
        model.save(os.path.join(model_path, 'model.h5'))
        
        # Save model config
        with open(os.path.join(model_path, 'config.json'), 'w') as f:
            json.dump(config, f)
        
        # Add to loaded models
        self.models[model_id] = {
            'model': model,
            'config': config
        }

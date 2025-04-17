
# Custom OCR/ML Model Backend

This is a Flask-based backend for training and using custom OCR/ML models.

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the server:
   ```
   python server.py
   ```

## API Endpoints

- `POST /api/train`: Train a new custom model
- `GET /api/models/<model_id>/status`: Check training status
- `GET /api/models`: List all available models
- `POST /api/extract`: Extract data from a document using a trained model

## Model Architecture

The OCR system uses a hybrid CNN+RNN architecture:
- CNN (based on VGG16) for feature extraction from document images
- Bidirectional LSTM layers for sequence modeling
- Custom output layer for text recognition

## Training Process

The training process includes:
1. Image preprocessing
2. Feature extraction
3. Model training with document samples
4. Field detection and mapping

## Note

This is a simplified implementation for demonstration purposes. A production-ready system would require more sophisticated algorithms for document analysis, text extraction, and field mapping.

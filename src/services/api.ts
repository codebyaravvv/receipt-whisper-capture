
interface ExtractResponse {
  success: boolean;
  data?: Record<string, string>;
  error?: string;
}

interface TrainingResponse {
  success: boolean;
  modelName?: string;
  error?: string;
  modelId?: string;
}

interface CustomModel {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  status: 'training' | 'ready' | 'failed';
}

// Custom OCR backend URL - point to the Flask server
const OCR_BACKEND_URL = "http://localhost:5000/api";

// API key management (will be removed in final version as we're building our own system)
const getApiKey = () => {
  return localStorage.getItem('ocr_api_key') || '';
};

// This will be deprecated once we fully transition to our custom model
export const hasApiKey = (): boolean => {
  return true; // Always return true since we're using our own backend now
};

// Will be deprecated
export const saveApiKey = (apiKey: string): void => {
  localStorage.setItem('ocr_api_key', apiKey);
};

export const fetchAvailableModels = async (): Promise<CustomModel[]> => {
  try {
    const response = await fetch(`${OCR_BACKEND_URL}/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    
    // Return empty array if can't connect to backend
    return [];
  }
};

export const extractInvoiceData = async (
  file: File,
  modelId: string
): Promise<ExtractResponse> => {
  try {
    // Create FormData object to send the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('modelId', modelId);

    const response = await fetch(`${OCR_BACKEND_URL}/extract`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR extraction failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.extracted_data || {},
    };
  } catch (error) {
    console.error('Error extracting data:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to extract data from invoice"
    };
  }
};

export const trainCustomModel = async (
  name: string,
  description: string,
  files: File[]
): Promise<TrainingResponse> => {
  try {
    // Create FormData object to send files
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    
    // Add all training files
    files.forEach(file => {
      formData.append('training_files', file);
    });

    const response = await fetch(`${OCR_BACKEND_URL}/train`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Model training failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      modelName: name,
      modelId: data.modelId
    };
  } catch (error) {
    console.error('Error training model:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to train custom model"
    };
  }
};

export const checkModelTrainingStatus = async (modelId: string): Promise<string> => {
  try {
    const response = await fetch(`${OCR_BACKEND_URL}/models/${modelId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check status: ${response.statusText}`);
    }

    const data = await response.json();
    return data.status || 'unknown';
  } catch (error) {
    console.error('Error checking model status:', error);
    return 'unknown';
  }
};


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

// OCR API endpoint - replace with your actual OCR API service URL
const OCR_API_URL = "https://api.ocr-service.com";

// API key management - in a real app, this would be server-side
const getApiKey = () => {
  // For demo purposes only - in production, API keys should never be stored in localStorage
  // This is a temporary solution until backend integration is complete
  return localStorage.getItem('ocr_api_key') || '';
};

// Check if API key exists
export const hasApiKey = (): boolean => {
  return !!getApiKey();
};

// Save API key (temporary solution)
export const saveApiKey = (apiKey: string): void => {
  localStorage.setItem('ocr_api_key', apiKey);
};

export const fetchAvailableModels = async (): Promise<CustomModel[]> => {
  try {
    if (!hasApiKey()) {
      throw new Error("API key not configured");
    }

    const response = await fetch(`${OCR_API_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
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
    
    // Fallback to localStorage models for development/demo purposes
    const mockModels = localStorage.getItem('customModels');
    return mockModels ? JSON.parse(mockModels) : [];
  }
};

export const extractInvoiceData = async (
  file: File,
  modelId: string
): Promise<ExtractResponse> => {
  try {
    if (!hasApiKey()) {
      throw new Error("API key not configured");
    }

    // Create FormData object to send the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('modelId', modelId);

    const response = await fetch(`${OCR_API_URL}/extract`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
        // Don't set Content-Type with FormData, browser will set it automatically with boundary
      },
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
    
    // Fallback sample response for development/demo if API fails
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        data: {
          "Invoice Number": "INV-2023-0042",
          "Date": "2023-04-16", 
          "Total Amount": "$1,245.00",
          "Vendor": "Office Supplies Inc."
        }
      };
    }
    
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
    if (!hasApiKey()) {
      throw new Error("API key not configured");
    }

    // Create FormData object to send files
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    
    // Add all training files
    files.forEach(file => {
      formData.append('training_files', file);
    });

    const response = await fetch(`${OCR_API_URL}/train`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
        // Don't set Content-Type with FormData, browser will set it automatically with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Model training failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Store model in localStorage for UI state preservation (temporary solution)
    const newModel = {
      id: data.model_id || `model_${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      status: 'training'
    };
    
    const existingModels = localStorage.getItem('customModels');
    const models = existingModels ? JSON.parse(existingModels) : [];
    models.push(newModel);
    localStorage.setItem('customModels', JSON.stringify(models));
    
    return {
      success: true,
      modelName: name,
      modelId: data.model_id
    };
  } catch (error) {
    console.error('Error training model:', error);
    
    // If API key missing, return specific error
    if (error instanceof Error && error.message === "API key not configured") {
      return {
        success: false,
        error: "API key not configured. Please set up your OCR API key in settings."
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to train custom model"
    };
  }
};

// New function to check training status
export const checkModelTrainingStatus = async (modelId: string): Promise<string> => {
  try {
    if (!hasApiKey()) {
      throw new Error("API key not configured");
    }

    const response = await fetch(`${OCR_API_URL}/models/${modelId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
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


import { toast } from "@/components/ui/use-toast";

interface ExtractResponse {
  success: boolean;
  data?: Record<string, string>;
  error?: string;
}

interface TrainingResponse {
  success: boolean;
  modelName?: string;
  error?: string;
}

interface CustomModel {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export const fetchAvailableModels = async (): Promise<CustomModel[]> => {
  // In a real app, this would be an API call to your backend
  try {
    // This would be replaced with actual API call using fetch
    // Example: const response = await fetch('/api/models');
    // const data = await response.json();
    
    // Simulating API response for demo
    const mockModels = localStorage.getItem('customModels');
    return mockModels ? JSON.parse(mockModels) : [];
  } catch (error) {
    console.error('Error fetching models:', error);
    toast({
      title: "Error",
      description: "Failed to fetch available models",
      variant: "destructive",
    });
    return [];
  }
};

export const extractInvoiceData = async (
  file: File,
  modelId: string
): Promise<ExtractResponse> => {
  // In a real app, this would upload the file to your backend
  try {
    // Simulating API call for demo purposes
    // Real implementation would use FormData to send the file
    console.log(`Extracting data from invoice using model: ${modelId}`);

    // Mock success response after 2 seconds (simulating processing time)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            "Invoice Number": "INV-2023-0042",
            "Date": "2023-04-16",
            "Due Date": "2023-05-16",
            "Total Amount": "$1,245.00",
            "Vendor": "Office Supplies Inc.",
            "Tax": "$105.00"
          }
        });
      }, 2000);
    });
  } catch (error) {
    console.error('Error extracting data:', error);
    return {
      success: false,
      error: "Failed to extract data from invoice"
    };
  }
};

export const trainCustomModel = async (
  name: string,
  description: string,
  files: File[]
): Promise<TrainingResponse> => {
  try {
    // Simulating API call for demo purposes
    console.log(`Training model "${name}" with ${files.length} files`);

    // In a real app, we would use FormData to send the files
    // const formData = new FormData();
    // formData.append('name', name);
    // formData.append('description', description);
    // files.forEach(file => {
    //   formData.append('training_files', file);
    // });
    
    // Simulate a delay for training (would be much longer in real-world)
    return new Promise((resolve) => {
      setTimeout(() => {
        // Save to localStorage for demo persistence
        const newModel = {
          id: `model_${Date.now()}`,
          name,
          description,
          createdAt: new Date().toISOString(),
        };
        
        const existingModels = localStorage.getItem('customModels');
        const models = existingModels ? JSON.parse(existingModels) : [];
        models.push(newModel);
        localStorage.setItem('customModels', JSON.stringify(models));
        
        resolve({
          success: true,
          modelName: name
        });
      }, 3000);
    });
  } catch (error) {
    console.error('Error training model:', error);
    return {
      success: false,
      error: "Failed to train custom model"
    };
  }
};

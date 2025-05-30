
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, X, UploadCloud, FileText, AlertTriangle, Brain } from "lucide-react";
import { trainCustomModel, hasApiKey, checkModelTrainingStatus } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import ApiKeyConfig from "@/components/ApiKeyConfig";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import BackendHealthCheck from "@/components/BackendHealthCheck";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Model name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

// Define the type for our form values
type FormValues = {
  name: string;
  description: string;
};

const TrainModel = () => {
  const [activeTab, setActiveTab] = useState("train");
  const [trainingFiles, setTrainingFiles] = useState<File[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [isApiConfigured, setIsApiConfigured] = useState(hasApiKey());
  const [currentModelId, setCurrentModelId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    let intervalId: number | undefined;
    
    if (currentModelId) {
      intervalId = window.setInterval(async () => {
        const status = await checkModelTrainingStatus(currentModelId);
        
        if (status === 'ready') {
          toast({
            title: "Training Complete",
            description: "Your custom model is now ready to use",
          });
          setCurrentModelId(null);
          setIsTraining(false);
          clearInterval(intervalId);
        } else if (status === 'failed') {
          toast({
            title: "Training Failed",
            description: "There was an issue training your model",
            variant: "destructive",
          });
          setCurrentModelId(null);
          setIsTraining(false);
          clearInterval(intervalId);
        }
      }, 10000); // Check every 10 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentModelId]);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const supportedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      return supportedTypes.includes(file.type);
    });
    
    if (validFiles.length !== fileArray.length) {
      toast({
        title: "Invalid file type",
        description: "Only PDF, JPEG, JPG, and PNG files are supported",
        variant: "destructive",
      });
    }
    
    setTrainingFiles(prev => [...prev, ...validFiles]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setTrainingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleApiKeyConfigured = () => {
    setIsApiConfigured(true);
  };

  const onSubmit = async (values: FormValues) => {
    if (!isApiConfigured) {
      toast({
        title: "API Key Required",
        description: "Please configure your OCR API key before training a model",
        variant: "destructive",
      });
      return;
    }
    
    if (trainingFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload at least one file for training",
        variant: "destructive",
      });
      return;
    }
    
    setIsTraining(true);
    
    try {
      const result = await trainCustomModel(
        values.name, 
        values.description, 
        trainingFiles
      );
      
      if (result.success) {
        toast({
          title: "Training Started",
          description: `Model "${result.modelName}" is now being trained. This may take several minutes.`,
        });
        
        if (result.modelId) {
          setCurrentModelId(result.modelId);
        }
        
        form.reset();
        setTrainingFiles([]);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to train model",
          variant: "destructive",
        });
        setIsTraining(false);
      }
    } catch (error) {
      console.error('Error during model training:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setIsTraining(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-semibold mb-6">Document Processing</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="extract">
            <Link to="/extract" className="w-full h-full flex items-center justify-center">
              Extract Data
            </Link>
          </TabsTrigger>
          <TabsTrigger value="train">Train Custom Model</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="mb-4">
        <BackendHealthCheck />
      </div>
      
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Brain className="h-5 w-5 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-indigo-800">Custom ML/OCR Model</h3>
            <p className="text-sm text-indigo-700 mt-1">
              This application uses a custom-built machine learning model for OCR processing.
              The model combines CNN (Convolutional Neural Networks) for feature extraction and
              RNN (Recurrent Neural Networks) for sequence modeling to recognize text in documents.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-medium mb-6">Train a New Model</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a name for your model" {...field} />
                  </FormControl>
                  <FormDescription>
                    This name will appear in the OCR model selection dropdown
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the purpose of this model" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    What type of invoices will this model be best for?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Upload Training Files</FormLabel>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelection}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
              />
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-primary transition-colors"
                onClick={openFileDialog}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <UploadCloud className="h-10 w-10 text-gray-400" />
                  <h3 className="text-base font-medium">Click to upload training files</h3>
                  <p className="text-sm text-gray-500 text-center">
                    Upload labeled invoice files (PDF, JPEG, JPG, PNG)
                    <br />
                    5-10 sample invoices recommended for optimal training
                  </p>
                </div>
              </div>
              
              {trainingFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Selected Files ({trainingFiles.length})</h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {trainingFiles.map((file, index) => (
                      <div 
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm truncate max-w-[250px]">{file.name}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-gray-500 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isTraining}
            >
              {isTraining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Training Model...
                </>
              ) : (
                'Start Training'
              )}
            </Button>
            
            <div className="space-y-4 mt-8 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium">About Our Custom ML/OCR Model</h3>
              <div className="text-xs text-gray-600 space-y-2">
                <p className="font-medium">Architecture:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>CNN layers (based on VGG16) for visual feature extraction</li>
                  <li>Bidirectional LSTM layers for sequence modeling</li>
                  <li>Custom dense layers for text recognition</li>
                </ul>
                
                <p className="font-medium mt-2">Training Process:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Data preprocessing and augmentation</li>
                  <li>Feature extraction from document images</li>
                  <li>Pattern recognition for field detection</li>
                  <li>Sequence modeling for text extraction</li>
                </ul>
                
                <p className="font-medium mt-2">Training Tips:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Use clear, high-resolution document images</li>
                  <li>Include diverse samples that represent your actual documents</li>
                  <li>Training typically takes 15-30 minutes depending on complexity</li>
                  <li>The more varied your training samples, the better the results</li>
                </ul>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default TrainModel;

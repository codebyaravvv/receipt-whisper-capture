
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Upload, FileText, Check, ArrowRight, Loader2 } from "lucide-react";
import { fetchAvailableModels, extractInvoiceData } from "@/services/api";

enum ProcessingStep {
  Upload = 0,
  Configure = 1,
  Results = 2
}

const ExtractData = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(ProcessingStep.Upload);
  const [selectedModel, setSelectedModel] = useState("google-vision");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: fetchAvailableModels
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if the file is of supported type
    const supportedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!supportedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPEG, JPG, or PNG file",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    
    setCurrentStep(ProcessingStep.Configure);
    setExtractedData(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const processInvoice = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    
    try {
      const result = await extractInvoiceData(selectedFile, selectedModel);
      
      if (result.success && result.data) {
        setExtractedData(result.data);
        setCurrentStep(ProcessingStep.Results);
        toast({
          title: "Success",
          description: "Invoice data extracted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to extract data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during extraction:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetProcess = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCurrentStep(ProcessingStep.Upload);
    setExtractedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-semibold mb-6">Extract Invoice Data</h1>
      
      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        <div className={`flex-1 relative flex flex-col items-center`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= ProcessingStep.Upload ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            <Upload size={20} />
          </div>
          <span className="mt-2 text-sm font-medium">Upload</span>
          {currentStep > ProcessingStep.Upload && (
            <div className="absolute right-0 top-5 w-1/2 h-0.5 bg-primary" />
          )}
        </div>
        
        <div className={`flex-1 relative flex flex-col items-center`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= ProcessingStep.Configure ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            <FileText size={20} />
          </div>
          <span className="mt-2 text-sm font-medium">Configure</span>
          {currentStep > ProcessingStep.Configure && (
            <div className="absolute right-0 top-5 w-1/2 h-0.5 bg-primary" />
          )}
          {currentStep > ProcessingStep.Upload && currentStep <= ProcessingStep.Configure && (
            <div className="absolute left-0 top-5 w-1/2 h-0.5 bg-primary" />
          )}
        </div>
        
        <div className={`flex-1 relative flex flex-col items-center`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= ProcessingStep.Results ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            <Check size={20} />
          </div>
          <span className="mt-2 text-sm font-medium">Results</span>
          {currentStep > ProcessingStep.Configure && (
            <div className="absolute left-0 top-5 w-1/2 h-0.5 bg-primary" />
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {currentStep === ProcessingStep.Upload && (
          <div className="text-center py-10">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 cursor-pointer hover:border-primary transition-colors"
                 onClick={triggerFileInput}>
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium">Click to upload an invoice</h3>
                <p className="text-sm text-gray-500">
                  Supported formats: PDF, JPEG, JPG, PNG
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Files will be processed securely and used only for data extraction
            </p>
          </div>
        )}
        
        {currentStep === ProcessingStep.Configure && selectedFile && (
          <div className="py-4">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {previewUrl && (
                <div className="bg-gray-50 p-2 rounded-md border max-w-xs">
                  <img 
                    src={previewUrl} 
                    alt="Invoice preview" 
                    className="max-h-64 w-auto object-contain mx-auto"
                  />
                </div>
              )}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-1">Selected File</h3>
                  <p className="text-sm text-gray-600">{selectedFile.name}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    OCR Model Selection
                  </label>
                  <Select 
                    value={selectedModel} 
                    onValueChange={setSelectedModel}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select OCR model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google-vision">Google Vision API (Default)</SelectItem>
                      {models.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} (Custom)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Select the OCR engine to use for data extraction
                  </p>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={resetProcess}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={processInvoice}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Extract Data
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {currentStep === ProcessingStep.Results && extractedData && (
          <div className="py-4">
            <h3 className="text-lg font-medium mb-4">Extracted Data</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-200 rounded-md">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Field</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(extractedData).map(([field, value]) => (
                    <tr key={field} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2 text-sm font-medium">{field}</td>
                      <td className="border border-gray-200 px-4 py-2 text-sm">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={resetProcess}
                variant="outline"
              >
                Process Another Invoice
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtractData;

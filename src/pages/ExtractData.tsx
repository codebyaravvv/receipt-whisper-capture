
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Check, FileText, UploadCloud, Loader2, RotateCw } from "lucide-react";
import { extractInvoiceData, fetchAvailableModels } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

const ExtractData = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [selectedModelId, setSelectedModelId] = useState("google-vision");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: availableModels = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ['models'],
    queryFn: fetchAvailableModels
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const supportedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    
    if (!supportedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF, JPEG, JPG, or PNG file",
        variant: "destructive",
      });
      return;
    }
    
    setInvoiceFile(file);
    setActiveStep(2);
  };

  const handleModelSelect = (value: string) => {
    setSelectedModelId(value);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const processInvoice = async () => {
    if (!invoiceFile) {
      toast({
        title: "No file selected",
        description: "Please upload an invoice file to process",
        variant: "destructive",
      });
      return;
    }
    
    setIsExtracting(true);
    
    try {
      const result = await extractInvoiceData(invoiceFile, selectedModelId);
      
      if (result.success && result.data) {
        setExtractedData(result.data);
        setActiveStep(3);
        toast({
          title: "Success",
          description: "Invoice data extracted successfully",
        });
      } else {
        toast({
          title: "Extraction failed",
          description: result.error || "Failed to extract data from invoice",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing invoice:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const startOver = () => {
    setInvoiceFile(null);
    setSelectedModelId("google-vision");
    setExtractedData(null);
    setActiveStep(1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-semibold mb-6">Extract Invoice Data</h1>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${activeStep >= 1 ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
            {activeStep > 1 ? <Check className="h-4 w-4" /> : '1'}
          </div>
          <div className={`flex-1 h-1 mx-2 ${activeStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${activeStep >= 2 ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
            {activeStep > 2 ? <Check className="h-4 w-4" /> : '2'}
          </div>
          <div className={`flex-1 h-1 mx-2 ${activeStep >= 3 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${activeStep >= 3 ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
            {activeStep > 3 ? <Check className="h-4 w-4" /> : '3'}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <div className="text-center" style={{marginLeft: '-10px'}}>Upload</div>
          <div className="text-center">Configure</div>
          <div className="text-center" style={{marginRight: '-10px'}}>Results</div>
        </div>
      </div>
      
      {/* Step 1: Upload */}
      {activeStep === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-medium mb-4">Upload Invoice</h2>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-primary transition-colors"
            onClick={handleUploadClick}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <UploadCloud className="h-10 w-10 text-gray-400" />
              <h3 className="text-lg font-medium">Click to upload an invoice</h3>
              <p className="text-sm text-gray-500 text-center">
                Upload your invoice in PDF, JPEG, JPG, or PNG format
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Step 2: Configure */}
      {activeStep === 2 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-medium mb-4">Configure Extraction</h2>
          
          <div className="mb-6">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
              <FileText className="h-6 w-6 text-gray-500" />
              <div className="flex-1 overflow-hidden">
                <p className="font-medium truncate">{invoiceFile?.name}</p>
                <p className="text-sm text-gray-500">
                  {invoiceFile?.size ? `${(invoiceFile.size / 1024).toFixed(2)} KB` : ''}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveStep(1)}
              >
                Change
              </Button>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="model-select">OCR Model Selection</Label>
              <Select 
                value={selectedModelId} 
                onValueChange={handleModelSelect}
                disabled={isLoadingModels}
              >
                <SelectTrigger id="model-select" className="w-full">
                  {isLoadingModels ? (
                    <div className="flex items-center">
                      <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading models...
                    </div>
                  ) : (
                    <SelectValue placeholder="Select OCR model" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google-vision">Google Vision API (Default)</SelectItem>
                  {availableModels.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                Select which OCR engine to use for extracting data
              </p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveStep(1)}>
              Back
            </Button>
            <Button 
              onClick={processInvoice} 
              disabled={isExtracting}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting Data...
                </>
              ) : (
                'Extract Data'
              )}
            </Button>
          </div>
        </div>
      )}
      
      {/* Step 3: Results */}
      {activeStep === 3 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-medium mb-4">Extracted Data</h2>
          
          {extractedData && (
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <table className="w-full">
                  <tbody>
                    {Object.entries(extractedData).map(([key, value]) => (
                      <tr key={key} className="border-b last:border-b-0">
                        <td className="py-2 font-medium text-gray-700">{key}</td>
                        <td className="py-2">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // In a real app, this would download data as CSV/Excel
                    toast({
                      title: "Export feature",
                      description: "In a production app, this would export the data to CSV/Excel",
                    });
                  }}
                >
                  Export to CSV
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    // In a real app, this would copy data to clipboard
                    toast({
                      title: "Copy feature",
                      description: "In a production app, this would copy the data to clipboard",
                    });
                  }}
                >
                  Copy to Clipboard
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={startOver}>
              Process Another Invoice
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtractData;

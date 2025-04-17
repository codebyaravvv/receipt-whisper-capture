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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { 
  Check, 
  FileText, 
  UploadCloud, 
  Loader2, 
  RotateCw, 
  FileJson, 
  FileSpreadsheet, 
  Download, 
  Clipboard,
  AlertTriangle 
} from "lucide-react";
import { extractInvoiceData, fetchAvailableModels, hasApiKey } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import * as XLSX from 'xlsx';
import { Link } from "react-router-dom";
import ApiKeyConfig from "@/components/ApiKeyConfig";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ExtractedDataItem {
  key: string;
  value: string;
  selected: boolean;
}

const ExtractData = () => {
  const [activeTab, setActiveTab] = useState("extract");
  const [activeStep, setActiveStep] = useState(1);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [selectedModelId, setSelectedModelId] = useState("default");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedDataItems, setExtractedDataItems] = useState<ExtractedDataItem[]>([]);
  const [finalExtractedData, setFinalExtractedData] = useState<Record<string, string> | null>(null);
  const [isApiConfigured, setIsApiConfigured] = useState(hasApiKey());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: availableModels = [], isLoading: isLoadingModels, refetch: refetchModels } = useQuery({
    queryKey: ['models'],
    queryFn: fetchAvailableModels,
    enabled: isApiConfigured,
  });

  const handleApiKeyConfigured = () => {
    setIsApiConfigured(true);
    refetchModels();
  };

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
    if (!isApiConfigured) {
      toast({
        title: "API Key Required",
        description: "Please configure your OCR API key before extracting data",
        variant: "destructive",
      });
      return;
    }
    
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
        const dataItems: ExtractedDataItem[] = Object.entries(result.data).map(([key, value]) => ({
          key,
          value: String(value),
          selected: true
        }));
        
        setExtractedDataItems(dataItems);
        setActiveStep(2.5);
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

  const handleToggleSelection = (index: number) => {
    setExtractedDataItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        selected: !updated[index].selected
      };
      return updated;
    });
  };

  const handleConfigureNext = () => {
    const selectedItems = extractedDataItems.filter(item => item.selected);
    
    const finalData: Record<string, string> = {};
    selectedItems.forEach(item => {
      finalData[item.key] = item.value;
    });
    
    setFinalExtractedData(finalData);
    setActiveStep(3);
  };

  const downloadJSON = () => {
    if (!finalExtractedData) return;
    
    const dataStr = JSON.stringify(finalExtractedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'invoice_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download complete",
      description: "JSON file downloaded successfully",
    });
  };

  const downloadExcel = () => {
    if (!finalExtractedData) return;
    
    const workbook = XLSX.utils.book_new();
    
    const worksheetData = [
      ['Key', 'Value'],
      ...Object.entries(finalExtractedData).map(([key, value]) => [key, value])
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoice Data');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'invoice_data.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download complete",
      description: "Excel file downloaded successfully",
    });
  };

  const copyToClipboard = () => {
    if (!finalExtractedData) return;
    
    const textData = Object.entries(finalExtractedData)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    navigator.clipboard.writeText(textData).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Invoice data copied to clipboard successfully",
      });
    }, (err) => {
      console.error('Could not copy text: ', err);
      toast({
        title: "Copy failed",
        description: "Failed to copy data to clipboard",
        variant: "destructive",
      });
    });
  };

  const startOver = () => {
    setInvoiceFile(null);
    setSelectedModelId("google-vision");
    setExtractedDataItems([]);
    setFinalExtractedData(null);
    setActiveStep(1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-semibold mb-6">Document Processing</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="extract">Extract Data</TabsTrigger>
          <TabsTrigger value="train">
            <Link to="/train" className="w-full h-full flex items-center justify-center">
              Train Custom Model
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <ApiKeyConfig onApiKeySet={handleApiKeyConfigured} />
      
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${activeStep >= 1 ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
            {activeStep > 1 ? <Check className="h-4 w-4" /> : '1'}
          </div>
          <div className={`flex-1 h-1 mx-2 ${activeStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${activeStep >= 2 ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
            {activeStep > 2.5 ? <Check className="h-4 w-4" /> : '2'}
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
      
      {activeTab === "extract" && (
        <>
          {activeStep === 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-medium mb-4">Upload Invoice</h2>
              
              {!isApiConfigured && (
                <Alert className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>API Key Required</AlertTitle>
                  <AlertDescription>
                    Configure your OCR API key above to enable data extraction
                  </AlertDescription>
                </Alert>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              
              <div 
                className={`border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-primary transition-colors ${!isApiConfigured ? 'opacity-50 pointer-events-none' : ''}`}
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
                    disabled={isLoadingModels || !isApiConfigured}
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
                      <SelectItem value="default">Default OCR Engine</SelectItem>
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
                  disabled={isExtracting || !isApiConfigured}
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
          
          {activeStep === 2.5 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-medium mb-4">Select Data to Extract</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  The OCR model has extracted the following data. Select the fields you want to include in the final result.
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Include</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Extracted Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extractedDataItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={item.selected}
                            onCheckedChange={() => handleToggleSelection(index)}
                            id={`check-${index}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Label htmlFor={`check-${index}`} className="cursor-pointer">
                            {item.key}
                          </Label>
                        </TableCell>
                        <TableCell>{item.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveStep(2)}>
                  Back
                </Button>
                <Button onClick={handleConfigureNext}>
                  Next
                </Button>
              </div>
            </div>
          )}
          
          {activeStep === 3 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-medium mb-4">Extracted Data</h2>
              
              {finalExtractedData && (
                <div className="space-y-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(finalExtractedData).map(([key, value]) => (
                          <tr key={key} className="border-b last:border-b-0">
                            <td className="py-2 font-medium text-gray-700">{key}</td>
                            <td className="py-2">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center gap-2"
                      onClick={downloadJSON}
                    >
                      <FileJson className="h-4 w-4" />
                      Download JSON
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="flex items-center justify-center gap-2"
                      onClick={downloadExcel}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Download EXCEL
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="flex items-center justify-center gap-2 md:col-span-2"
                      onClick={copyToClipboard}
                    >
                      <Clipboard className="h-4 w-4" />
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
        </>
      )}
    </div>
  );
};

export default ExtractData;

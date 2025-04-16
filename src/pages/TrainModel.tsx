
import { useState, useRef } from "react";
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
import { Loader2, Upload, X, UploadCloud, FileText } from "lucide-react";
import { trainCustomModel } from "@/services/api";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Model name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

const TrainModel = () => {
  const [trainingFiles, setTrainingFiles] = useState<File[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Convert FileList to array and validate file types
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
    
    // Reset input value to allow selecting the same file again
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
          title: "Success",
          description: `Model "${result.modelName}" has been trained and is now available for use`,
        });
        
        // Reset form
        form.reset();
        setTrainingFiles([]);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to train model",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during model training:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-semibold mb-6">Train Custom OCR Model</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
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
                    2-3 sample invoices recommended for initial training
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
            
            <div className="text-xs text-gray-500 mt-4">
              <p className="mb-1">Training notes:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Training typically takes 5-15 minutes depending on file size and complexity</li>
                <li>The more diverse your training samples, the better the model will perform</li>
                <li>Once training is complete, your model will be available in the OCR model dropdown</li>
              </ul>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default TrainModel;

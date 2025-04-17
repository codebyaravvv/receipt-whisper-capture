
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { saveApiKey, hasApiKey } from "@/services/api";
import { KeyRound, CheckCircle2 } from "lucide-react";

interface ApiKeyConfigProps {
  onApiKeySet: () => void;
}

const ApiKeyConfig = ({ onApiKeySet }: ApiKeyConfigProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showConfig, setShowConfig] = useState(!hasApiKey());

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    saveApiKey(apiKey);
    setShowConfig(false);
    toast({
      title: "Success",
      description: "API key saved successfully",
    });
    onApiKeySet();
  };

  if (!showConfig && hasApiKey()) {
    return (
      <div className="mb-6 flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
          <span>OCR API configured</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowConfig(true)}
        >
          Update API Key
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>OCR API Configuration</CardTitle>
        <CardDescription>
          Enter your OCR API key to enable model training and document extraction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium">
              API Key
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                id="apiKey" 
                type="text" 
                placeholder="Enter your OCR API key"
                className="pl-10"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-500">
              Your API key is stored locally and is only used to authenticate with the OCR service
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveApiKey}>Save API Key</Button>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyConfig;

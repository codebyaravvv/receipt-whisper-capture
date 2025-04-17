
import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

const OCR_BACKEND_URL = "http://localhost:5000/api";

const BackendHealthCheck = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        console.log('Checking backend health at:', OCR_BACKEND_URL);
        const response = await fetch(`${OCR_BACKEND_URL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add a timeout to prevent hanging
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          console.log('Backend connection successful');
          setStatus('connected');
          setError(null);
          
          // If we were previously disconnected, show success toast
          if (status === 'disconnected' && checkCount > 0) {
            toast({
              title: "Backend Connected",
              description: "Successfully connected to the ML/OCR backend",
              variant: "default"
            });
          }
        } else {
          const errorText = await response.text();
          console.error('Backend health check failed:', response.status, errorText);
          setStatus('disconnected');
          
          // Only show toast for first error or if status changes
          if (status !== 'disconnected') {
            toast({
              title: "Backend Connection Failed",
              description: `Server responded with status ${response.status}: ${errorText}`,
              variant: "destructive"
            });
          }

          setError(`Server responded with status ${response.status}`);
        }
      } catch (error) {
        console.error('Backend connection error:', error);
        setStatus('disconnected');
        
        // Only show toast for first error or if status changes
        if (status !== 'disconnected') {
          // More detailed error handling
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          toast({
            title: "Backend Connection Error",
            description: `Could not connect to ML/OCR backend: ${errorMessage}`,
            variant: "destructive"
          });
        }

        setError(error instanceof Error ? error.message : 'Unknown error');
      }
      
      // Increment check count
      setCheckCount(prev => prev + 1);
    };

    // Check immediately and then every 10 seconds
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 10000);

    return () => clearInterval(interval);
  }, [status, checkCount]);

  if (status === 'checking') {
    return (
      <div className="flex items-center space-x-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-md">
        <AlertCircle className="h-4 w-4" />
        <span>Connecting to ML/OCR backend...</span>
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
        <CheckCircle2 className="h-4 w-4" />
        <span>ML/OCR backend connected</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-1 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
      <div className="flex items-center space-x-2">
        <XCircle className="h-4 w-4" />
        <span>ML/OCR backend not connected</span>
      </div>
      {error && <p className="text-xs ml-6">{error}</p>}
      <p className="text-xs ml-6">
        Make sure the Python backend is running. Try using the simplified start script.
      </p>
    </div>
  );
};

export default BackendHealthCheck;

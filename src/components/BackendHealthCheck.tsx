
import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

// Backend URL from environment or fallback to localhost
const OCR_BACKEND_URL = "http://localhost:5000/api";

const BackendHealthCheck = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [checkCount, setCheckCount] = useState(0);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const checkBackendHealth = useCallback(async () => {
    try {
      console.log('Checking backend health at:', OCR_BACKEND_URL);
      
      // Add cache-busting parameter
      const cacheBuster = new Date().getTime();
      const url = `${OCR_BACKEND_URL}/health?_=${cacheBuster}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'omit', // Don't send cookies
        mode: 'cors',  // Explicitly set CORS mode
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        console.log('Backend connection successful');
        setStatus('connected');
        setError(null);
        setRetryAttempt(0);
        
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
        
        // Increment retry counter
        setRetryAttempt(prev => prev + 1);
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
      
      // Increment retry counter
      setRetryAttempt(prev => prev + 1);
    } finally {
      setIsRetrying(false);
    }
    
    // Increment check count
    setCheckCount(prev => prev + 1);
  }, [status, checkCount]);

  useEffect(() => {
    // Check immediately
    checkBackendHealth();
    
    // Dynamic check interval based on connection status
    const interval = setInterval(() => {
      checkBackendHealth();
    }, status === 'connected' ? 30000 : 10000); // Less frequent checks to avoid flooding

    return () => clearInterval(interval);
  }, [checkBackendHealth, status]);

  const handleManualRetry = () => {
    setStatus('checking');
    setIsRetrying(true);
    checkBackendHealth();
  };

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

  // Disconnected state with detailed troubleshooting info
  return (
    <div className="flex flex-col space-y-1 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
      <div className="flex items-center space-x-2">
        <XCircle className="h-4 w-4" />
        <span>ML/OCR backend not connected</span>
      </div>
      {error && <p className="text-xs ml-6">{error}</p>}
      <div className="text-xs ml-6 space-y-1">
        <p>Troubleshooting steps:</p>
        <ol className="list-decimal ml-4 space-y-1">
          <li>Make sure the backend server is running using <code>./start_simple.sh</code> (Mac/Linux) or <code>start_simple.bat</code> (Windows)</li>
          <li>Check that port 5000 is not in use by another application</li>
          <li>Ensure your firewall is not blocking connections</li>
          <li>Try restarting your browser</li>
        </ol>
        <button 
          onClick={handleManualRetry}
          disabled={isRetrying}
          className="mt-2 text-blue-600 hover:text-blue-800 font-medium flex items-center disabled:opacity-50"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry Connection
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BackendHealthCheck;

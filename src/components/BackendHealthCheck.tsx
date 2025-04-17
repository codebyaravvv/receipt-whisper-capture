
import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const OCR_BACKEND_URL = "http://localhost:5000/api";

const BackendHealthCheck = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        console.log('Checking backend health...');
        const response = await fetch(`${OCR_BACKEND_URL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log('Backend connection successful');
          setStatus('connected');
          setError(null);
        } else {
          console.error('Backend health check failed:', response.status, response.statusText);
          setStatus('disconnected');
          setError(`Server responded with status ${response.status}`);
        }
      } catch (error) {
        console.error('Backend connection error:', error);
        setStatus('disconnected');
        setError(error instanceof Error ? error.message : 'Could not connect to ML/OCR backend');
      }
    };

    // Check immediately and then every 10 seconds
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 10000);

    return () => clearInterval(interval);
  }, []);

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
        Make sure the Python backend is running. You can restart it by running the start script.
      </p>
    </div>
  );
};

export default BackendHealthCheck;

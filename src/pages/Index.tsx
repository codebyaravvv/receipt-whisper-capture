
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Upload, Database } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">Invoice Processing System</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Receipt Whisper</h2>
            <p className="text-lg text-gray-600 mb-6">
              Streamline your invoice processing with our advanced OCR technology. Extract data automatically and train custom models for your specific invoice formats.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-blue-50 mr-4">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Extract Invoice Data</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Upload invoices to extract data automatically using Google Vision API or your custom-trained OCR models.
                </p>
                <Link to="/extract">
                  <Button className="w-full">Go to Extract Data</Button>
                </Link>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-purple-50 mr-4">
                    <Database className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Train Custom Models</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Create and train custom OCR models tailored to your specific invoice formats for improved accuracy.
                </p>
                <Link to="/train">
                  <Button className="w-full">Train Custom Model</Button>
                </Link>
              </div>
            </div>
          </section>
          
          <section className="bg-white rounded-lg shadow-md p-6 mb-12">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-semibold">1</span>
                </div>
                <h3 className="font-medium mb-2">Upload Invoice</h3>
                <p className="text-sm text-gray-600">
                  Upload your invoice in PDF, JPEG, JPG, or PNG format
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-semibold">2</span>
                </div>
                <h3 className="font-medium mb-2">Select OCR Model</h3>
                <p className="text-sm text-gray-600">
                  Choose between Google Vision API or your custom-trained models
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-semibold">3</span>
                </div>
                <h3 className="font-medium mb-2">Get Results</h3>
                <p className="text-sm text-gray-600">
                  View extracted data and export it to your preferred format
                </p>
              </div>
            </div>
          </section>
          
          <section className="text-center pb-8">
            <h2 className="text-xl font-semibold mb-3">Ready to get started?</h2>
            <p className="text-gray-600 mb-6">Begin by extracting data from your first invoice or train a custom model.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/extract">
                <Button size="lg">
                  <Upload className="mr-2 h-4 w-4" />
                  Extract Invoice Data
                </Button>
              </Link>
              <Link to="/train">
                <Button size="lg" variant="outline">
                  <Database className="mr-2 h-4 w-4" />
                  Train Custom Model
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© 2025 Receipt Whisper. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

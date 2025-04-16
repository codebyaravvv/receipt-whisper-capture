
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, LogIn } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Receipt Whisper
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Automate your invoice data extraction with advanced OCR technology
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleNavigation}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <FileText className="mr-2" />
              Extract Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleNavigation}
              className="bg-transparent border-white text-white hover:bg-white/10"
            >
              <LogIn className="mr-2" />
              Try For Free
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">
                Upload Invoice
              </h3>
              <p className="text-gray-600 text-center">
                Simply upload your invoice in PDF, JPEG, or PNG format.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">
                OCR Processing
              </h3>
              <p className="text-gray-600 text-center">
                Our advanced OCR technology reads and extracts key information.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">
                View & Export
              </h3>
              <p className="text-gray-600 text-center">
                Review the extracted data and export it in your preferred format.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Receipt Whisper
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Time Saving</h3>
              <p className="text-gray-600">
                Reduce manual data entry by up to 95% with our automated extraction.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">High Accuracy</h3>
              <p className="text-gray-600">
                Advanced OCR models ensure precision in data extraction.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Custom Models</h3>
              <p className="text-gray-600">
                Train custom models for your specific invoice formats.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Secure</h3>
              <p className="text-gray-600">
                Your data is processed securely and never shared with third parties.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Export Options</h3>
              <p className="text-gray-600">
                Export extracted data in various formats including Excel and JSON.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Detailed History</h3>
              <p className="text-gray-600">
                Keep track of all your extraction activities with detailed logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that are saving time and reducing errors with Receipt Whisper.
          </p>
          <Button
            size="lg"
            onClick={handleNavigation}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Try For Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="mb-4">© 2025 Receipt Whisper. All rights reserved.</p>
            <div className="flex justify-center space-x-4">
              <a href="#" className="hover:text-blue-400">Terms</a>
              <a href="#" className="hover:text-blue-400">Privacy</a>
              <a href="#" className="hover:text-blue-400">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

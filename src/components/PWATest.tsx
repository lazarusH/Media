import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { CheckCircle, XCircle, Smartphone, Download } from 'lucide-react';

export function PWATest() {
  const [pwaSupported, setPwaSupported] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const results: string[] = [];

    // Test 1: Service Worker Support
    if ('serviceWorker' in navigator) {
      results.push('✅ Service Worker supported');
      setPwaSupported(true);
    } else {
      results.push('❌ Service Worker not supported');
    }

    // Test 2: Manifest Support
    if (document.querySelector('link[rel="manifest"]')) {
      results.push('✅ Manifest file found');
    } else {
      results.push('❌ Manifest file not found');
    }

    // Test 3: HTTPS/HTTP Check
    if (location.protocol === 'https:' || location.hostname === 'localhost') {
      results.push('✅ Secure context (HTTPS or localhost)');
    } else {
      results.push('❌ Not secure context - PWA requires HTTPS');
    }

    // Test 4: Install Prompt Support
    if ('BeforeInstallPromptEvent' in window) {
      results.push('✅ Install prompt supported');
    } else {
      results.push('⚠️ Install prompt not supported (iOS Safari)');
    }

    // Test 5: Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      results.push('✅ App is installed (standalone mode)');
      setIsInstalled(true);
    } else if ((window.navigator as any).standalone === true) {
      results.push('✅ App is installed (iOS standalone)');
      setIsInstalled(true);
    } else {
      results.push('ℹ️ App not installed');
    }

    setTestResults(results);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      results.push('✅ Install prompt received');
      setTestResults([...results]);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setTestResults(prev => [...prev, '✅ User accepted installation']);
          setIsInstalled(true);
        } else {
          setTestResults(prev => [...prev, '❌ User dismissed installation']);
        }
      } catch (error) {
        setTestResults(prev => [...prev, `❌ Error: ${error.message}`]);
      }
    } else {
      setTestResults(prev => [...prev, '⚠️ No native install prompt available']);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">PWA Installation Test</h2>
          <p className="text-gray-600">Test the Add to Home Screen functionality</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">PWA Support</h3>
            <div className="flex items-center space-x-2">
              {pwaSupported ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm text-gray-600">
                {pwaSupported ? 'Supported' : 'Not Supported'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Installation Status</h3>
            <div className="flex items-center space-x-2">
              {isInstalled ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-yellow-500" />
              )}
              <span className="text-sm text-gray-600">
                {isInstalled ? 'Installed' : 'Not Installed'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Test Results</h3>
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm text-gray-700">
                {result}
              </div>
            ))}
          </div>
        </div>

        {deferredPrompt && !isInstalled && (
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-primary">Install Prompt Available</h4>
                <p className="text-sm text-gray-600">Click the button below to test the installation</p>
              </div>
              <Button
                onClick={handleInstall}
                className="bg-gradient-to-r from-primary to-primary-glow text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Test Install
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Instructions</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Android Chrome:</strong> Look for "Add to Home screen" in the menu</li>
            <li>• <strong>iOS Safari:</strong> Tap Share → Add to Home Screen</li>
            <li>• <strong>Desktop:</strong> Look for install icon in address bar</li>
            <li>• <strong>Test:</strong> Refresh the page to see if banner appears</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

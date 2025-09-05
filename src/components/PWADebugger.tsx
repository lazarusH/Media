import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { RefreshCw, Download, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';

export function PWADebugger() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const info: any = {};

    // 1. Check if we're in a secure context
    info.secureContext = location.protocol === 'https:' || location.hostname === 'localhost';
    info.protocol = location.protocol;
    info.hostname = location.hostname;

    // 2. Check service worker support
    info.serviceWorkerSupported = 'serviceWorker' in navigator;
    
    // 3. Check if service worker is registered
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        info.serviceWorkerRegistered = !!registration;
        info.serviceWorkerState = registration?.active?.state || 'none';
      } catch (error) {
        info.serviceWorkerError = error.message;
      }
    }

    // 4. Check manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    info.manifestExists = !!manifestLink;
    info.manifestHref = manifestLink?.getAttribute('href');

    // 5. Check manifest content
    if (manifestLink) {
      try {
        const response = await fetch(manifestLink.getAttribute('href')!);
        const manifest = await response.json();
        info.manifestContent = manifest;
        info.manifestValid = !!(manifest.name && manifest.short_name && manifest.icons);
      } catch (error) {
        info.manifestError = error.message;
      }
    }

    // 6. Check display mode
    info.displayMode = window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser';
    info.iosStandalone = (window.navigator as any).standalone === true;

    // 7. Check user agent
    info.userAgent = navigator.userAgent;
    info.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    info.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    info.isAndroid = /Android/.test(navigator.userAgent);

    // 8. Check PWA criteria
    info.hasManifest = !!manifestLink;
    info.hasServiceWorker = info.serviceWorkerRegistered;
    info.isSecure = info.secureContext;
    info.meetsPWARequirements = info.hasManifest && info.hasServiceWorker && info.isSecure;

    // 9. Check install prompt support
    info.installPromptSupported = 'BeforeInstallPromptEvent' in window;

    setDebugInfo(info);
    setIsLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const testInstallPrompt = () => {
    console.log('🔍 Testing install prompt...');
    
    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🔍 beforeinstallprompt event received!', e);
      alert('Install prompt is available! Check console for details.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Remove listener after 10 seconds
    setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      console.log('🔍 Install prompt listener removed');
    }, 10000);

    alert('Listening for install prompt for 10 seconds. Try refreshing the page or wait for the prompt to appear.');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">PWA Debugger</h2>
            <p className="text-gray-600">Comprehensive PWA diagnostics</p>
          </div>
        </div>
        <Button
          onClick={runDiagnostics}
          disabled={isLoading}
          className="bg-gradient-to-r from-primary to-primary-glow text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Running...' : 'Run Diagnostics'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* PWA Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-2 ${debugInfo.isSecure ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center space-x-2 mb-2">
              {debugInfo.isSecure ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-semibold">Secure Context</span>
            </div>
            <p className="text-sm text-gray-600">
              {debugInfo.isSecure ? 'HTTPS or localhost' : 'Not secure - PWA requires HTTPS'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Protocol: {debugInfo.protocol}
            </p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${debugInfo.hasManifest ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center space-x-2 mb-2">
              {debugInfo.hasManifest ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-semibold">Manifest</span>
            </div>
            <p className="text-sm text-gray-600">
              {debugInfo.hasManifest ? 'Found' : 'Missing'}
            </p>
            {debugInfo.manifestHref && (
              <p className="text-xs text-gray-500 mt-1">
                {debugInfo.manifestHref}
              </p>
            )}
          </div>

          <div className={`p-4 rounded-lg border-2 ${debugInfo.hasServiceWorker ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center space-x-2 mb-2">
              {debugInfo.hasServiceWorker ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-semibold">Service Worker</span>
            </div>
            <p className="text-sm text-gray-600">
              {debugInfo.hasServiceWorker ? 'Registered' : 'Not registered'}
            </p>
            {debugInfo.serviceWorkerState && (
              <p className="text-xs text-gray-500 mt-1">
                State: {debugInfo.serviceWorkerState}
              </p>
            )}
          </div>
        </div>

        {/* Install Prompt Test */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">Install Prompt Test</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 mb-1">
                Support: {debugInfo.installPromptSupported ? '✅ Supported' : '❌ Not supported'}
              </p>
              <p className="text-xs text-blue-600">
                {debugInfo.isMobile ? 'Mobile device detected' : 'Desktop device detected'}
              </p>
            </div>
            <Button
              onClick={testInstallPrompt}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Test Install Prompt
            </Button>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Detailed Information</h3>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">User Agent:</span>
                <p className="text-xs text-gray-600 break-all">{debugInfo.userAgent}</p>
              </div>
              <div>
                <span className="font-medium">Display Mode:</span>
                <p className="text-xs text-gray-600">{debugInfo.displayMode}</p>
              </div>
            </div>
            {debugInfo.manifestContent && (
              <div>
                <span className="font-medium">Manifest Content:</span>
                <pre className="text-xs text-gray-600 bg-white p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(debugInfo.manifestContent, null, 2)}
                </pre>
              </div>
            )}
            {debugInfo.serviceWorkerError && (
              <div className="text-red-600">
                <span className="font-medium">Service Worker Error:</span>
                <p className="text-xs">{debugInfo.serviceWorkerError}</p>
              </div>
            )}
            {debugInfo.manifestError && (
              <div className="text-red-600">
                <span className="font-medium">Manifest Error:</span>
                <p className="text-xs">{debugInfo.manifestError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

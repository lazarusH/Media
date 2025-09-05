import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download, RefreshCw, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPromptTrigger() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎉 Install prompt received!');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('✅ App installed successfully!');
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    setIsLoading(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      } else {
        setAttempts(prev => prev + 1);
      }
    } catch (error) {
      setAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInstalled) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">App is installed!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Download className="w-5 h-5 text-blue-600" />
          <span className="text-blue-800 font-medium">Install App</span>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-blue-700">
            {deferredPrompt 
              ? '✅ Install prompt is available! Click the button below to install.'
              : '⚠️ Install prompt not available. Try the options below.'
            }
          </p>
          
          {attempts > 0 && (
            <p className="text-xs text-blue-600">
              Attempts: {attempts}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {deferredPrompt ? (
            <Button
              onClick={handleInstall}
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-primary-glow text-white"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Installing...' : 'Install Now'}
            </Button>
          ) : (
            <div className="text-sm text-blue-600">
              Install prompt not available. Try using the app for a few minutes, then refresh the page.
            </div>
          )}
        </div>

        <div className="text-xs text-blue-600">
          <p><strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Make sure you're using Chrome, Edge, or Safari</li>
            <li>Try using the app for a few minutes first</li>
            <li>Check if your browser supports PWA installation</li>
            <li>Make sure you're on HTTPS or localhost</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download, Bell } from 'lucide-react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWANotificationBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🔍 beforeinstallprompt event received');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      // Store in localStorage to prevent showing again
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed (from localStorage)
    if (localStorage.getItem('pwa-installed') === 'true') {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed in this session
    if (sessionStorage.getItem('pwa-banner-dismissed') === 'true') {
      return;
    }

    // Show banner after 5 seconds (less aggressive)
    const showTimer = setTimeout(() => {
      console.log('🔍 Timer triggered - showing banner');
      console.log('🔍 Is installed:', isInstalled);
      if (!isInstalled) {
        setShowBanner(true);
        // Show install button if available
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
          installBtn.style.display = 'block';
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(showTimer);
    };
  }, [isInstalled]);

  // Effect to manage spacer when banner shows/hides
  useEffect(() => {
    const spacer = document.getElementById('pwa-banner-spacer');
    if (spacer) {
      if (showBanner && !isInstalled) {
        spacer.className = 'h-16 transition-all duration-300'; // Increased height for better spacing
      } else {
        spacer.className = 'h-0 transition-all duration-300';
      }
    }
  }, [showBanner, isInstalled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setShowBanner(false);
          setDeferredPrompt(null);
          localStorage.setItem('pwa-installed', 'true');
        }
      } catch (error) {
        console.error('Install error:', error);
      }
    } else {
      // Hide banner if no prompt available
      setShowBanner(false);
      sessionStorage.setItem('pwa-banner-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remove spacer
    const spacer = document.getElementById('pwa-banner-spacer');
    if (spacer) {
      spacer.className = 'h-0 transition-all duration-300';
    }
    // Don't show again for this session
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  console.log('🔍 Banner render check:', { isInstalled, showBanner, deferredPrompt: !!deferredPrompt });
  
  if (isInstalled || !showBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-primary-glow text-white shadow-lg animate-in slide-in-from-top duration-500">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                <span className="font-bold">አፕሊኬሽኑን ወደ ስልክ ይጨመሩ!</span>
                <span className="ml-2 text-white/90">
                  ቀላል ተደራሽነት ያግኙ
                </span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Button
              id="installBtn"
              onClick={handleInstallClick}
              size="sm"
              className="bg-white/90 hover:bg-white text-gray-900 border-white/50 shadow-lg hover:shadow-xl transition-all duration-200 font-medium px-4 py-2 rounded-lg"
              style={{ display: 'none' }}
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="font-semibold">Add to Home Screen</span>
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
